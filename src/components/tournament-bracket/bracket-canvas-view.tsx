'use client';

import React from 'react';
import {
  DEFAULT_VIEWPORT,
  FIT_MAX_ZOOM,
  FIT_PADDING,
  MAX_ZOOM,
  MIN_ZOOM,
  slotKey,
} from './bracket-primitive';
import {
  BracketLockButtonPart,
  BracketRoot,
  BracketSlotPart,
  BracketSurface,
} from './bracket-parts';
import { drawBracketCanvas } from './canvas-renderer';
import { resolveBracketTheme } from './canvas-theme';
import type { Viewport } from '@ui-sdk/core';
import type { Match } from '@/contracts/matches/dto';
import type { TournamentAthlete } from '@/contracts/tournament-athletes/dto';
import type {
  BracketCanvasLayout,
  BracketConnectorPath,
  BracketLayoutResult,
} from '@/lib/tournament/bracket/bracket-layout';
import type { BracketCanvasTheme } from './canvas-theme';
import type {
  BracketCorner,
  BracketHit,
} from '@/lib/tournament/bracket/bracket-layout/hit-test';
import {
  buildMatchIndex,
  hitTestBracket,
  resolveMatchSlots,
} from '@/lib/tournament/bracket/bracket-layout/hit-test';
import { useBracketLayout } from '@/hooks/use-bracket-layout';

export interface BracketCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  getViewport: () => Viewport;
  screenToWorld: (
    clientX: number,
    clientY: number
  ) => { x: number; y: number } | null;
  hitTestClient: (clientX: number, clientY: number) => BracketHit | null;
}

export interface BracketCanvasViewProps {
  matches: Array<Match>;
  thirdPlaceMatch: boolean;
  athleteMap: ReadonlyMap<string, TournamentAthlete>;
  matchLabel: ReadonlyMap<string, number | null>;
  readOnly: boolean;
  layoutMode?: BracketCanvasLayout;
  defaultLayoutMode?: BracketCanvasLayout;
  onLayoutModeChange?: (next: BracketCanvasLayout) => void;
  selectedMatchId?: string | null;
  onSlotClick: (match: Match) => void;
  onToggleLock: (matchId: string, side: BracketCorner, locked: boolean) => void;
  onAssignSlot?: (
    matchId: string,
    side: BracketCorner,
    tournamentAthleteId: string | null
  ) => void;
  onSwapSlots?: (
    matchAId: string,
    sideA: BracketCorner,
    matchBId: string,
    sideB: BracketCorner
  ) => void;
  onSwapParticipants?: (matchId: string) => void;
  layout?: BracketLayoutResult;
  connectors?: Array<BracketConnectorPath>;
  dropTarget?: { matchId: string; side: BracketCorner } | null;
  ariaLabel?: string;
  canvasRef?: React.Ref<BracketCanvasHandle>;
  onSlotPointerDown?: (
    hit: Extract<BracketHit, { kind: 'slot' }>,
    event: React.PointerEvent<HTMLCanvasElement>
  ) => boolean;
}

function computeFitViewport(
  containerW: number,
  containerH: number,
  contentW: number,
  contentH: number
): Viewport {
  if (containerW <= 0 || containerH <= 0 || contentW <= 0 || contentH <= 0) {
    return DEFAULT_VIEWPORT;
  }
  const zoom = Math.max(
    MIN_ZOOM,
    Math.min(
      FIT_MAX_ZOOM,
      (containerW - FIT_PADDING * 2) / contentW,
      (containerH - FIT_PADDING * 2) / contentH
    )
  );
  return {
    x: (containerW - contentW * zoom) / 2,
    y: (containerH - contentH * zoom) / 2,
    zoom,
  };
}

export function BracketCanvasView({
  matches,
  thirdPlaceMatch,
  athleteMap,
  matchLabel,
  readOnly,
  layoutMode: controlledLayoutMode,
  defaultLayoutMode = 'two-sided',
  onLayoutModeChange,
  selectedMatchId = null,
  onSlotClick,
  onToggleLock,
  onAssignSlot,
  onSwapSlots,
  onSwapParticipants,
  layout: precomputedLayout,
  connectors: precomputedConnectors,
  dropTarget = null,
  ariaLabel = 'Tournament bracket',
  canvasRef,
  onSlotPointerDown,
}: BracketCanvasViewProps) {
  const [uncontrolledLayout, setUncontrolledLayout] =
    React.useState<BracketCanvasLayout>(defaultLayoutMode);
  const layoutMode = controlledLayoutMode ?? uncontrolledLayout;

  const { layout, connectors } = useBracketLayout(matches, thirdPlaceMatch, {
    layout: precomputedLayout,
    connectors: precomputedConnectors,
    layoutMode,
  });

  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const htmlCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const [viewport, setViewport] = React.useState<Viewport>(DEFAULT_VIEWPORT);
  const [hoveredHit, setHoveredHit] = React.useState<BracketHit | null>(null);
  const [focusedSlotKey, setFocusedSlotKey] = React.useState<string | null>(
    null
  );
  const [theme, setTheme] = React.useState<BracketCanvasTheme>(() =>
    resolveBracketTheme(null)
  );

  const viewportRef = React.useRef(viewport);
  viewportRef.current = viewport;

  const dragRef = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  const fitView = React.useCallback(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setViewport(
      computeFitViewport(rect.width, rect.height, layout.width, layout.height)
    );
  }, [layout.width, layout.height]);

  const zoomAt = React.useCallback(
    (factor: number, clientX?: number, clientY?: number) => {
      const el = surfaceRef.current;
      const rect = el?.getBoundingClientRect();
      const cx =
        clientX !== undefined && rect
          ? clientX - rect.left
          : (rect?.width ?? size.width) / 2;
      const cy =
        clientY !== undefined && rect
          ? clientY - rect.top
          : (rect?.height ?? size.height) / 2;

      setViewport((prev) => {
        const nextZoom = Math.max(
          MIN_ZOOM,
          Math.min(MAX_ZOOM, prev.zoom * factor)
        );
        const ratio = nextZoom / prev.zoom;
        return {
          x: cx - (cx - prev.x) * ratio,
          y: cy - (cy - prev.y) * ratio,
          zoom: nextZoom,
        };
      });
    },
    [size.width, size.height]
  );

  const screenToWorld = React.useCallback(
    (clientX: number, clientY: number) => {
      const el = surfaceRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const vp = viewportRef.current;
      return {
        x: (clientX - rect.left - vp.x) / vp.zoom,
        y: (clientY - rect.top - vp.y) / vp.zoom,
      };
    },
    []
  );

  const hitTestClient = React.useCallback(
    (clientX: number, clientY: number) => {
      const world = screenToWorld(clientX, clientY);
      if (!world) return null;
      return hitTestBracket(world, layout, { readOnly });
    },
    [screenToWorld, layout, readOnly]
  );

  React.useImperativeHandle(
    canvasRef,
    () => ({
      zoomIn: () => zoomAt(1.15),
      zoomOut: () => zoomAt(1 / 1.15),
      fitView,
      getViewport: () => viewportRef.current,
      screenToWorld,
      hitTestClient,
    }),
    [zoomAt, fitView, screenToWorld, hitTestClient]
  );

  // Observe surface resize and auto-fit when layout dimensions change
  React.useLayoutEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
      setTheme(resolveBracketTheme(el));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useLayoutEffect(() => {
    if (size.width > 0 && size.height > 0 && layout.width > 0) {
      setViewport(
        computeFitViewport(size.width, size.height, layout.width, layout.height)
      );
    }
  }, [layout.width, layout.height, layoutMode, size.width, size.height]);

  // Observe light/dark theme toggle on documentElement
  React.useEffect(() => {
    if (typeof MutationObserver === 'undefined' || !surfaceRef.current) return;
    const el = surfaceRef.current;
    setTheme(resolveBracketTheme(el));
    const mo = new MutationObserver(() => setTheme(resolveBracketTheme(el)));
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => mo.disconnect();
  }, []);

  // Dirty-flag requestAnimationFrame paint loop (zero idle frames)
  React.useEffect(() => {
    const canvas = htmlCanvasRef.current;
    if (!canvas || size.width <= 0 || size.height <= 0) return;

    let rafId = 0;
    rafId = requestAnimationFrame(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.round(size.width * dpr);
      const targetH = Math.round(size.height * dpr);
      if (canvas.width !== targetW) canvas.width = targetW;
      if (canvas.height !== targetH) canvas.height = targetH;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      drawBracketCanvas(ctx, {
        layout,
        connectors,
        layoutMode,
        matches,
        athleteMap,
        matchLabel,
        viewport,
        dpr,
        width: size.width,
        height: size.height,
        readOnly,
        selectedMatchId,
        focusedSlotKey,
        hoveredHit: hoveredHit
          ? {
              kind: hoveredHit.kind,
              matchId: hoveredHit.matchId,
              side: hoveredHit.side,
            }
          : null,
        dropTarget,
        theme,
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [
    layout,
    connectors,
    layoutMode,
    matches,
    athleteMap,
    matchLabel,
    viewport,
    size.width,
    size.height,
    readOnly,
    selectedMatchId,
    focusedSlotKey,
    hoveredHit,
    dropTarget,
    theme,
  ]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;
    const hit = hitTestClient(event.clientX, event.clientY);
    if (hit?.kind === 'lock') {
      event.stopPropagation();
      const locked =
        hit.side === 'red' ? hit.pos.match.redLocked : hit.pos.match.blueLocked;
      onToggleLock(hit.matchId, hit.side, !locked);
      return;
    }
    if (hit?.kind === 'slot' && onSlotPointerDown?.(hit, event)) {
      return;
    }
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: viewportRef.current.x,
      originY: viewportRef.current.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (drag && drag.pointerId === event.pointerId) {
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (Math.hypot(dx, dy) > 4) drag.moved = true;
      if (drag.moved) {
        setViewport((prev) => ({
          ...prev,
          x: drag.originX + dx,
          y: drag.originY + dy,
        }));
      }
      return;
    }
    setHoveredHit(hitTestClient(event.clientX, event.clientY));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (drag && drag.pointerId === event.pointerId) {
      const wasClick = !drag.moved;
      dragRef.current = null;
      if (wasClick) {
        const hit = hitTestClient(event.clientX, event.clientY);
        if (hit?.kind === 'slot') {
          onSlotClick(hit.pos.match);
        }
      }
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    zoomAt(factor, event.clientX, event.clientY);
  };

  const matchIndex = React.useMemo(() => buildMatchIndex(matches), [matches]);

  return (
    <BracketRoot
      aria-label={ariaLabel}
      matches={matches}
      thirdPlaceMatch={thirdPlaceMatch}
      athleteMap={athleteMap}
      matchLabel={matchLabel}
      readOnly={readOnly}
      layoutMode={layoutMode}
      onLayoutModeChange={(next) => {
        if (controlledLayoutMode === undefined) setUncontrolledLayout(next);
        onLayoutModeChange?.(next);
      }}
      selectedMatchId={selectedMatchId}
      viewport={viewport}
      onViewportChange={(next) => setViewport(next)}
      onSelectMatch={onSlotClick}
      onToggleLock={onToggleLock}
      onAssignSlot={onAssignSlot}
      onSwapSlots={onSwapSlots}
      onSwapParticipants={onSwapParticipants}
      className="relative size-full min-h-0 overflow-hidden select-none"
    >
      <BracketSurface
        ref={surfaceRef}
        className="relative size-full min-h-0 touch-none overflow-hidden"
      >
        <canvas
          ref={htmlCanvasRef}
          aria-hidden="true"
          data-bracket-canvas
          className="block size-full cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => setHoveredHit(null)}
          onWheel={handleWheel}
        />

        <div className="sr-only">
          {layout.positions.map((pos) => {
            const resolved = resolveMatchSlots(
              pos.match,
              matchIndex,
              athleteMap,
              matchLabel
            );
            return (
              <React.Fragment key={pos.match.id}>
                {(['red', 'blue'] as const).map((side) => {
                  const key = slotKey(pos.match.id, side);
                  const display =
                    side === 'red' ? resolved.redDisplay : resolved.blueDisplay;
                  const locked =
                    side === 'red' ? pos.match.redLocked : pos.match.blueLocked;
                  return (
                    <React.Fragment key={key}>
                      <BracketSlotPart
                        value={key}
                        matchId={pos.match.id}
                        side={side}
                        round={pos.match.round}
                        matchIndex={pos.match.matchIndex}
                        wing={pos.wing}
                        aria-label={`${resolved.header} ${side} corner ${display}`}
                        onFocus={() => setFocusedSlotKey(key)}
                        onBlur={() =>
                          setFocusedSlotKey((prev) =>
                            prev === key ? null : prev
                          )
                        }
                      >
                        {`${resolved.header} ${side} corner ${display}`}
                      </BracketSlotPart>
                      {!readOnly && (
                        <BracketLockButtonPart
                          value={`lock:${key}`}
                          matchId={pos.match.id}
                          side={side}
                          locked={locked}
                          aria-label={`${locked ? 'Unlock' : 'Lock'} ${resolved.header} ${side} corner`}
                        >
                          {locked ? 'Unlock' : 'Lock'}
                        </BracketLockButtonPart>
                      )}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </BracketSurface>
    </BracketRoot>
  );
}
