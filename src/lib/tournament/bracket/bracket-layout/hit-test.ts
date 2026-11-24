import { isBracketFinal } from './index';
import type { Match } from '@/contracts/matches/dto';
import type { TournamentAthlete } from '@/contracts/tournament-athletes/dto';
import type { BracketLayoutResult, MatchPosition } from './types';
import { ATHLETE_ROW_H, MATCH_H, MATCH_W } from '@/config/bracket';
import {
  formatFeederWinnerPlaceholder,
  formatMatchHeaderLine,
} from '@/server/domain/tournament/arena/match-label';

export const FINAL_CARD_SCALE = 1.2;
export const LOCK_BUTTON_W = 28;
export const LOCK_BUTTON_H = 26;
export const LOCK_BUTTON_PAD = 4;

export type BracketCorner = 'red' | 'blue';

export interface WorldRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface MatchCardGeometry extends WorldRect {
  scale: number;
  isFinal: boolean;
  direction: 'ltr' | 'rtl';
}

export type BracketHit =
  | { kind: 'lock'; matchId: string; side: BracketCorner; pos: MatchPosition }
  | { kind: 'slot'; matchId: string; side: BracketCorner; pos: MatchPosition };

export interface MatchIndex {
  byId: Map<string, Match>;
  byCoord: Map<string, Match>;
}

export interface ResolvedMatchSlots {
  header: string;
  redName: string | null;
  blueName: string | null;
  redDisplay: string;
  blueDisplay: string;
  isRedWinner: boolean;
  isBlueWinner: boolean;
}

export function matchCoordKey(
  divisionId: string,
  round: number,
  matchIndex: number
): string {
  return `${divisionId}:${round}:${matchIndex}`;
}

export function buildMatchIndex(matches: ReadonlyArray<Match>): MatchIndex {
  const byId = new Map<string, Match>();
  const byCoord = new Map<string, Match>();
  for (const m of matches) {
    byId.set(m.id, m);
    byCoord.set(matchCoordKey(m.divisionId, m.round, m.matchIndex), m);
  }
  return { byId, byCoord };
}

export function getMatchCardGeometry(
  pos: MatchPosition,
  layoutMaxRound: number
): MatchCardGeometry {
  const isFinal = isBracketFinal(pos.match, layoutMaxRound);
  const scale = isFinal ? FINAL_CARD_SCALE : 1;
  const width = MATCH_W * scale;
  const height = MATCH_H * scale;
  const overhangX = (width - MATCH_W) / 2;
  const overhangY = (height - MATCH_H) / 2;
  const left = pos.x - overhangX;
  const top = pos.y - overhangY;
  const direction: 'ltr' | 'rtl' =
    !isFinal && pos.wing === 'right' ? 'rtl' : 'ltr';

  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    scale,
    isFinal,
    direction,
  };
}

export function getSlotRect(
  pos: MatchPosition,
  side: BracketCorner,
  layoutMaxRound: number
): WorldRect {
  const card = getMatchCardGeometry(pos, layoutMaxRound);
  const rowH = ATHLETE_ROW_H * card.scale;
  const top = side === 'red' ? card.top : card.top + rowH;
  return {
    left: card.left,
    top,
    right: card.right,
    bottom: top + rowH,
    width: card.width,
    height: rowH,
  };
}

export function getLockButtonRect(
  pos: MatchPosition,
  side: BracketCorner,
  layoutMaxRound: number
): WorldRect {
  const card = getMatchCardGeometry(pos, layoutMaxRound);
  const slot = getSlotRect(pos, side, layoutMaxRound);
  const btnW = LOCK_BUTTON_W * card.scale;
  const btnH = LOCK_BUTTON_H * card.scale;
  const pad = LOCK_BUTTON_PAD * card.scale;
  const left =
    card.direction === 'rtl' ? slot.left + pad : slot.right - pad - btnW;
  const top = slot.top + (slot.height - btnH) / 2;
  return {
    left,
    top,
    right: left + btnW,
    bottom: top + btnH,
    width: btnW,
    height: btnH,
  };
}

function pointInRect(
  point: { x: number; y: number },
  rect: WorldRect
): boolean {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

export function hitTestBracket(
  point: { x: number; y: number },
  layout: BracketLayoutResult,
  options?: { readOnly?: boolean }
): BracketHit | null {
  const readOnly = options?.readOnly ?? false;
  for (let i = layout.positions.length - 1; i >= 0; i--) {
    const pos = layout.positions[i]!;
    const card = getMatchCardGeometry(pos, layout.layoutMaxRound);
    if (!pointInRect(point, card)) continue;

    const side: BracketCorner =
      point.y < card.top + card.height / 2 ? 'red' : 'blue';

    if (!readOnly) {
      const lockRect = getLockButtonRect(pos, side, layout.layoutMaxRound);
      if (pointInRect(point, lockRect)) {
        return { kind: 'lock', matchId: pos.match.id, side, pos };
      }
    }

    return { kind: 'slot', matchId: pos.match.id, side, pos };
  }
  return null;
}

export function resolveMatchSlots(
  match: Match,
  index: MatchIndex,
  athleteMap: ReadonlyMap<string, TournamentAthlete>,
  matchLabel: ReadonlyMap<string, number | null>
): ResolvedMatchSlots {
  const resolveTaName = (id: string) => athleteMap.get(id)?.name ?? null;
  const redName = match.redTournamentAthleteId
    ? resolveTaName(match.redTournamentAthleteId)
    : null;
  const blueName = match.blueTournamentAthleteId
    ? resolveTaName(match.blueTournamentAthleteId)
    : null;

  const cornersSwapped = match.round > 0 && match.cornersSwapped;

  const resolveEmpty = (side: BracketCorner): string => {
    if (match.round === 0) return 'Open';
    const feederSide = cornersSwapped
      ? side === 'red'
        ? 'blue'
        : 'red'
      : side;
    const feederIndex = match.matchIndex * 2 + (feederSide === 'red' ? 0 : 1);
    const feeder = index.byCoord.get(
      matchCoordKey(match.divisionId, match.round - 1, feederIndex)
    );
    if (!feeder) return 'Winner pending';
    return formatFeederWinnerPlaceholder(feeder, matchLabel, resolveTaName);
  };

  return {
    header: formatMatchHeaderLine(matchLabel.get(match.id) ?? null, {
      bothSlotsOpen:
        !match.redTournamentAthleteId && !match.blueTournamentAthleteId,
    }),
    redName,
    blueName,
    redDisplay: redName ?? resolveEmpty('red'),
    blueDisplay: blueName ?? resolveEmpty('blue'),
    isRedWinner:
      match.winnerId != null && match.winnerId === match.redAthleteId,
    isBlueWinner:
      match.winnerId != null && match.winnerId === match.blueAthleteId,
  };
}
