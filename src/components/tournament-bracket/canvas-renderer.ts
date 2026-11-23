import type { Viewport } from '@ui-sdk/core';
import type { Match } from '@/contracts/matches/dto';
import type { TournamentAthlete } from '@/contracts/tournament-athletes/dto';
import type { BracketCanvasTheme } from './canvas-theme';
import type {
  BracketCanvasLayout,
  BracketConnectorPath,
  BracketLayoutResult,
  MatchPosition,
} from '@/lib/tournament/bracket/bracket-layout';
import type {
  BracketCorner,
  MatchCardGeometry,
  MatchIndex,
} from '@/lib/tournament/bracket/bracket-layout/hit-test';
import { roundLabelPlacements } from '@/lib/tournament/bracket/bracket-layout';
import {
  buildMatchIndex,
  getLockButtonRect,
  getMatchCardGeometry,
  getSlotRect,
  resolveMatchSlots,
} from '@/lib/tournament/bracket/bracket-layout/hit-test';
import { MATCH_HEADER_ABOVE, MATCH_W, ROUND_LABEL_Y } from '@/config/bracket';

export interface BracketCanvasScene {
  layout: BracketLayoutResult;
  connectors: Array<BracketConnectorPath>;
  layoutMode: BracketCanvasLayout;
  matches: Array<Match>;
  athleteMap: ReadonlyMap<string, TournamentAthlete>;
  matchLabel: ReadonlyMap<string, number | null>;
  viewport: Viewport;
  dpr: number;
  width: number;
  height: number;
  readOnly: boolean;
  selectedMatchId: string | null;
  focusedSlotKey: string | null;
  hoveredHit: {
    kind: 'slot' | 'lock';
    matchId: string;
    side: BracketCorner;
  } | null;
  dropTarget: { matchId: string; side: BracketCorner } | null;
  theme: BracketCanvasTheme;
  fillBackground?: boolean;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (maxWidth <= 0) return '';
  if (ctx.measureText(text).width <= maxWidth) return text;
  const ellipsis = '…';
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (ctx.measureText(text.slice(0, mid) + ellipsis).width <= maxWidth) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo <= 0 ? ellipsis : text.slice(0, lo) + ellipsis;
}

function drawLockIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  locked: boolean,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const bodyW = 8 * scale;
  const bodyH = 6 * scale;
  drawRoundedRect(
    ctx,
    cx - bodyW / 2,
    cy - bodyH / 2 + 2 * scale,
    bodyW,
    bodyH,
    1.5 * scale
  );
  ctx.stroke();

  const shackleR = 2.5 * scale;
  ctx.beginPath();
  if (locked) {
    ctx.arc(cx, cy - bodyH / 2 + 2 * scale, shackleR, Math.PI, 0, false);
  } else {
    ctx.arc(
      cx + 1 * scale,
      cy - bodyH / 2 + 1.5 * scale,
      shackleR,
      Math.PI * 1.15,
      -0.1,
      false
    );
  }
  ctx.stroke();
  ctx.restore();
}

function drawConnectorPaths(
  ctx: CanvasRenderingContext2D,
  connectors: Array<BracketConnectorPath>,
  theme: BracketCanvasTheme
) {
  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const c of connectors) {
    ctx.strokeStyle =
      c.status === 'complete'
        ? theme.connectorComplete
        : c.status === 'active'
          ? theme.connectorActive
          : theme.connectorPending;
    if (typeof Path2D !== 'undefined') {
      ctx.stroke(new Path2D(c.d));
    }
  }
  ctx.restore();
}

function drawRoundLabels(
  ctx: CanvasRenderingContext2D,
  scene: BracketCanvasScene
) {
  const { layout, layoutMode, theme } = scene;
  const placements = roundLabelPlacements(
    layout.positions,
    layout.layoutMaxRound,
    layoutMode
  );

  ctx.save();
  ctx.font = `600 11px ${theme.fontSans}`;
  ctx.fillStyle = theme.labelText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const item of placements) {
    ctx.fillText(item.label.toUpperCase(), item.x, ROUND_LABEL_Y);
  }

  if (layout.thirdPlace) {
    const tpPos = layout.positions.find(
      (p) => p.match.id === layout.thirdPlace?.id
    );
    if (tpPos) {
      ctx.fillText(
        'THIRD PLACE',
        tpPos.x + MATCH_W / 2,
        tpPos.y - MATCH_HEADER_ABOVE - 14
      );
    }
  }
  ctx.restore();
}

function drawTopHalfRoundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h);
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h);
}

function drawBottomHalfRoundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h - radius);
  ctx.arcTo(x, y + h, x + radius, y + h, radius);
  ctx.lineTo(x + w - radius, y + h);
  ctx.arcTo(x + w, y + h, x + w, y + h - radius, radius);
  ctx.lineTo(x + w, y);
}

function drawFinalEdgeDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  theme: BracketCanvasTheme
) {
  const size = 10 * scale;
  const half = size / 2;
  const corner = 2.5 * scale;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);

  // Outer offset ring (matches ring-1 ring-zinc-700 ring-offset-1)
  drawRoundedRect(
    ctx,
    -half - 1.5 * scale,
    -half - 1.5 * scale,
    size + 3 * scale,
    size + 3 * scale,
    corner + 1 * scale
  );
  ctx.fillStyle = theme.background;
  ctx.fill();
  ctx.strokeStyle = theme.isDark ? '#52525b' : '#3f3f46';
  ctx.lineWidth = 1 * scale;
  ctx.stroke();

  // Inner diamond body
  drawRoundedRect(ctx, -half, -half, size, size, corner);
  ctx.fillStyle = theme.isDark ? '#27272a' : '#f4f4f5';
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1 * scale;
  ctx.stroke();

  // Centered Circle icon inside the diamond
  ctx.beginPath();
  ctx.arc(0, 0, 2.2 * scale, 0, Math.PI * 2);
  ctx.strokeStyle = theme.textMuted;
  ctx.lineWidth = 1.2 * scale;
  ctx.stroke();

  ctx.restore();
}

function drawMatchCard(
  ctx: CanvasRenderingContext2D,
  pos: MatchPosition,
  index: MatchIndex,
  scene: BracketCanvasScene
) {
  const {
    layout,
    athleteMap,
    matchLabel,
    readOnly,
    selectedMatchId,
    focusedSlotKey,
    hoveredHit,
    dropTarget,
    theme,
  } = scene;

  const geom: MatchCardGeometry = getMatchCardGeometry(
    pos,
    layout.layoutMaxRound
  );
  const resolved = resolveMatchSlots(pos.match, index, athleteMap, matchLabel);
  const isSelected = selectedMatchId === pos.match.id;
  const s = geom.scale;
  const radius = 8 * s;

  // Header line above match card
  ctx.save();
  ctx.font = `500 ${Math.round(11 * s)}px ${theme.fontMono}`;
  ctx.fillStyle = theme.textMuted;
  ctx.textAlign = geom.isFinal
    ? 'center'
    : geom.direction === 'rtl'
      ? 'right'
      : 'left';
  ctx.textBaseline = 'bottom';
  const headerX = geom.isFinal
    ? geom.left + geom.width / 2
    : geom.direction === 'rtl'
      ? geom.right - 2
      : geom.left + 2;
  ctx.fillText(resolved.header, headerX, geom.top - 4 * s);
  ctx.restore();

  // Card background and border
  ctx.save();
  if (geom.isFinal) {
    ctx.shadowColor = theme.isDark
      ? 'rgba(0, 0, 0, 0.45)'
      : 'rgba(9, 9, 11, 0.14)';
    ctx.shadowBlur = 12 * s;
    ctx.shadowOffsetY = 3 * s;
  }
  drawRoundedRect(ctx, geom.left, geom.top, geom.width, geom.height, radius);
  ctx.fillStyle = theme.cardBg;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  if (geom.isFinal) {
    // Subtle outer halo ring matching ring-ring/50 ring-2 on final card
    drawRoundedRect(
      ctx,
      geom.left - 1.5 * s,
      geom.top - 1.5 * s,
      geom.width + 3 * s,
      geom.height + 3 * s,
      radius + 1.5 * s
    );
    ctx.lineWidth = 2 * s;
    ctx.strokeStyle = theme.isDark
      ? 'rgba(161, 161, 170, 0.35)'
      : 'rgba(113, 113, 122, 0.35)';
    ctx.stroke();
    drawRoundedRect(ctx, geom.left, geom.top, geom.width, geom.height, radius);
  } else {
    const statusBorder =
      pos.match.status === 'complete'
        ? theme.cardBorderComplete
        : pos.match.status === 'active'
          ? theme.cardBorderActive
          : theme.cardBorder;
    ctx.lineWidth = 1 * s;
    ctx.strokeStyle = isSelected ? theme.selectedRing : statusBorder;
    ctx.stroke();
  }

  // Clip interior for corner bars, winner tints, and hover/drop fills
  ctx.clip();

  for (const side of ['red', 'blue'] as const) {
    const slotRect = getSlotRect(pos, side, layout.layoutMaxRound);
    const isWinner =
      side === 'red' ? resolved.isRedWinner : resolved.isBlueWinner;
    const isHovered =
      hoveredHit?.matchId === pos.match.id && hoveredHit.side === side;
    const isDrop =
      dropTarget?.matchId === pos.match.id && dropTarget.side === side;

    if (isWinner) {
      ctx.fillStyle =
        side === 'red' ? theme.winnerTintRed : theme.winnerTintBlue;
      ctx.fillRect(
        slotRect.left,
        slotRect.top,
        slotRect.width,
        slotRect.height
      );
    } else if (isHovered) {
      ctx.fillStyle = theme.hoverTint;
      ctx.fillRect(
        slotRect.left,
        slotRect.top,
        slotRect.width,
        slotRect.height
      );
    }

    if (isDrop) {
      ctx.fillStyle = theme.dropFill;
      ctx.fillRect(
        slotRect.left,
        slotRect.top,
        slotRect.width,
        slotRect.height
      );
      ctx.strokeStyle = theme.dropRing;
      ctx.lineWidth = 2 * s;
      ctx.strokeRect(
        slotRect.left + 1,
        slotRect.top + 1,
        slotRect.width - 2,
        slotRect.height - 2
      );
    }

    // Standard nodes show a side corner accent bar; final node uses full half-box red/blue borders
    if (!geom.isFinal) {
      const barW = 4 * s;
      const barX =
        geom.direction === 'rtl' ? slotRect.right - barW : slotRect.left;
      ctx.fillStyle = side === 'red' ? theme.redAccent : theme.blueAccent;
      ctx.fillRect(barX, slotRect.top, barW, slotRect.height);
    }

    // Athlete name or feeder placeholder
    const text = side === 'red' ? resolved.redDisplay : resolved.blueDisplay;
    const hasAthlete =
      side === 'red' ? resolved.redName !== null : resolved.blueName !== null;
    const locked = side === 'red' ? pos.match.redLocked : pos.match.blueLocked;
    const wins = side === 'red' ? pos.match.redWins : pos.match.blueWins;
    const showScore =
      pos.match.status === 'active' || pos.match.status === 'complete';

    const lockReserve = readOnly ? 8 * s : 32 * s;
    const scoreReserve = showScore ? 24 * s : 0;
    const padStart = (geom.isFinal ? 10 : 12) * s;
    const maxTextW = slotRect.width - padStart - lockReserve - scoreReserve;

    ctx.font = `${isWinner ? '600' : '500'} ${Math.round(12 * s)}px ${theme.fontSans}`;
    ctx.fillStyle = locked
      ? theme.lockedColor
      : hasAthlete
        ? theme.textPrimary
        : theme.textMuted;
    ctx.textBaseline = 'middle';
    ctx.textAlign = geom.direction === 'rtl' ? 'right' : 'left';
    const textX =
      geom.direction === 'rtl'
        ? slotRect.right - padStart
        : slotRect.left + padStart;
    const cy = slotRect.top + slotRect.height / 2;
    ctx.fillText(truncateText(ctx, text, maxTextW), textX, cy);

    if (showScore) {
      ctx.font = `600 ${Math.round(12 * s)}px ${theme.fontMono}`;
      ctx.fillStyle = isWinner ? theme.textPrimary : theme.textMuted;
      ctx.textAlign = geom.direction === 'rtl' ? 'left' : 'right';
      const scoreX =
        geom.direction === 'rtl'
          ? slotRect.left + lockReserve + 6 * s
          : slotRect.right - lockReserve - 6 * s;
      ctx.fillText(String(wins), scoreX, cy);
    }

    if (!readOnly) {
      const lockRect = getLockButtonRect(pos, side, layout.layoutMaxRound);
      drawLockIcon(
        ctx,
        lockRect.left + lockRect.width / 2,
        lockRect.top + lockRect.height / 2,
        s,
        locked,
        locked ? theme.lockedColor : theme.unlockedColor
      );
    }

    if (focusedSlotKey === `${pos.match.id}:${side}`) {
      ctx.strokeStyle = theme.focusRing;
      ctx.lineWidth = 2 * s;
      ctx.strokeRect(
        slotRect.left + 1.5,
        slotRect.top + 1.5,
        slotRect.width - 3,
        slotRect.height - 3
      );
    }
  }

  // Horizontal divider between red and blue corners
  const midY = geom.top + geom.height / 2;
  if (geom.isFinal) {
    const sepH = 4 * s;
    ctx.fillStyle = theme.isDark ? '#27272a' : '#f4f4f5';
    ctx.fillRect(geom.left, midY - sepH / 2, geom.width, sepH);
  } else {
    ctx.beginPath();
    ctx.moveTo(geom.left, midY);
    ctx.lineTo(geom.right, midY);
    ctx.strokeStyle = theme.divider;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();

  // Final card distinct half-box borders (red top half, blue bottom half) and left/right edge diamonds
  if (geom.isFinal) {
    const halfH = geom.height / 2;
    const inset = 1 * s;
    ctx.save();
    ctx.lineWidth = 2 * s;

    drawTopHalfRoundedPath(
      ctx,
      geom.left + inset,
      geom.top + inset,
      geom.width - inset * 2,
      halfH - inset,
      radius
    );
    ctx.strokeStyle = theme.redAccent;
    ctx.stroke();

    drawBottomHalfRoundedPath(
      ctx,
      geom.left + inset,
      geom.top + halfH,
      geom.width - inset * 2,
      halfH - inset,
      radius
    );
    ctx.strokeStyle = theme.blueAccent;
    ctx.stroke();
    ctx.restore();

    drawFinalEdgeDiamond(ctx, geom.left, geom.top + halfH, s, theme);
    drawFinalEdgeDiamond(ctx, geom.right, geom.top + halfH, s, theme);
  }

  // Outer selection halo when selected
  if (isSelected) {
    ctx.save();
    drawRoundedRect(
      ctx,
      geom.left - 2,
      geom.top - 2,
      geom.width + 4,
      geom.height + 4,
      radius + 2
    );
    ctx.strokeStyle = theme.selectedRing;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

export function drawBracketCanvas(
  ctx: CanvasRenderingContext2D,
  scene: BracketCanvasScene
): void {
  const { dpr, width, height, viewport, theme, fillBackground } = scene;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (fillBackground) {
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  ctx.setTransform(
    dpr * viewport.zoom,
    0,
    0,
    dpr * viewport.zoom,
    dpr * viewport.x,
    dpr * viewport.y
  );

  drawConnectorPaths(ctx, scene.connectors, theme);
  drawRoundLabels(ctx, scene);

  const index = buildMatchIndex(scene.matches);
  for (const pos of scene.layout.positions) {
    drawMatchCard(ctx, pos, index, scene);
  }

  ctx.restore();
}
