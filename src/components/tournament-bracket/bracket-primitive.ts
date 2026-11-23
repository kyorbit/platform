import {
  createChange,
  createFocusRecovery,
  createRovingFocus,
  createViewport,
  definePrimitive,
  isRTL,
  selects,
} from '@ui-sdk/core';
import type { ChangeDetails, Viewport, ViewportReason } from '@ui-sdk/core';
import type { Match } from '@/contracts/matches/dto';
import type { TournamentAthlete } from '@/contracts/tournament-athletes/dto';
import type {
  BracketCanvasLayout,
  BracketLayoutResult,
  MatchPosition,
} from '@/lib/tournament/bracket/bracket-layout';
import type { BracketCorner } from '@/lib/tournament/bracket/bracket-layout/hit-test';
import { canvasBuilders } from '@/lib/tournament/bracket/bracket-layout';
import {
  buildMatchIndex,
  getMatchCardGeometry,
  resolveMatchSlots,
} from '@/lib/tournament/bracket/bracket-layout/hit-test';

// Custom bracket reasons extend @ui-sdk/core's ReasonVocabulary.
export type BracketLayoutChangeReason =
  'item-press' | 'layout-toggle' | 'programmatic';

export type BracketSelectionChangeReason =
  'item-press' | 'list-navigation' | 'programmatic';

export type BracketViewportChangeReason = ViewportReason | 'programmatic';

export type BracketOptions = {
  matches: Array<Match>;
  thirdPlaceMatch?: boolean;
  athleteMap?: ReadonlyMap<string, TournamentAthlete>;
  matchLabel?: ReadonlyMap<string, number | null>;
  readOnly?: boolean;
  layoutMode?: BracketCanvasLayout;
  defaultLayoutMode?: BracketCanvasLayout;
  onLayoutModeChange?: (
    value: BracketCanvasLayout,
    details: ChangeDetails<BracketLayoutChangeReason>
  ) => void;
  selectedMatchId?: string | null;
  defaultSelectedMatchId?: string | null;
  onSelectedMatchIdChange?: (
    value: string | null,
    details: ChangeDetails<BracketSelectionChangeReason>
  ) => void;
  viewport?: Viewport;
  defaultViewport?: Viewport;
  onViewportChange?: (
    value: Viewport,
    details: ChangeDetails<BracketViewportChangeReason>
  ) => void;
  onSelectMatch?: (match: Match) => void;
  onToggleLock?: (
    matchId: string,
    side: BracketCorner,
    locked: boolean
  ) => void;
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
};

export type BracketState = {
  layoutMode: BracketCanvasLayout;
  selectedMatchId: string | null;
  focusedSlotKey: string | null;
  viewport: Viewport;
  readOnly: boolean;
  thirdPlaceMatch: boolean;
  matches: Array<Match>;
};

export type BracketSlotPartProps = {
  value: string;
  matchId: string;
  side: BracketCorner;
  round: number;
  matchIndex: number;
  wing: 'left' | 'right' | 'center';
};

export type BracketLockButtonPartProps = {
  value: string;
  matchId: string;
  side: BracketCorner;
  locked: boolean;
};

export const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 2.5;
export const FIT_MAX_ZOOM = 1.25;
export const FIT_PADDING = 32;

const EMPTY_ATHLETES = new Map<string, TournamentAthlete>();
const EMPTY_LABELS = new Map<string, number | null>();

export function slotKey(matchId: string, side: BracketCorner): string {
  return `${matchId}:${side}`;
}

export function parseSlotKey(
  key: string
): { matchId: string; side: BracketCorner } | null {
  const idx = key.lastIndexOf(':');
  if (idx === -1) return null;
  const matchId = key.slice(0, idx);
  const side = key.slice(idx + 1);
  if (side !== 'red' && side !== 'blue') return null;
  return { matchId, side };
}

function computeLayout(
  matches: Array<Match>,
  thirdPlaceMatch: boolean,
  layoutMode: BracketCanvasLayout
): BracketLayoutResult {
  const bracketMatches = matches.filter((m) => m.kind !== 'custom');
  return canvasBuilders[layoutMode].layout(bracketMatches, thirdPlaceMatch);
}

function findNextPositionInDirection(
  positions: Array<MatchPosition>,
  from: MatchPosition,
  direction: 'left' | 'right' | 'up' | 'down'
): MatchPosition | null {
  let best: MatchPosition | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidate of positions) {
    if (candidate.match.id === from.match.id) continue;
    const dx = candidate.x - from.x;
    const dy = candidate.y - from.y;

    if (direction === 'right' && dx <= 1) continue;
    if (direction === 'left' && dx >= -1) continue;
    if (direction === 'down' && dy <= 1) continue;
    if (direction === 'up' && dy >= -1) continue;

    const primary =
      direction === 'left' || direction === 'right'
        ? Math.abs(dx)
        : Math.abs(dy);
    const secondary =
      direction === 'left' || direction === 'right'
        ? Math.abs(dy)
        : Math.abs(dx);
    const score = primary + secondary * 2.5;
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best;
}

export const bracketPrimitive = definePrimitive({
  name: 'tournament-bracket',
  options: {
    matches: 'value',
    thirdPlaceMatch: 'boolean',
    athleteMap: 'value',
    matchLabel: 'value',
    readOnly: 'boolean',
    layoutMode: 'string',
    defaultLayoutMode: 'string',
    onLayoutModeChange: 'callback',
    selectedMatchId: 'value',
    defaultSelectedMatchId: 'value',
    onSelectedMatchIdChange: 'callback',
    viewport: 'value',
    defaultViewport: 'value',
    onViewportChange: 'callback',
    onSelectMatch: 'callback',
    onToggleLock: 'callback',
    onAssignSlot: 'callback',
    onSwapSlots: 'callback',
    onSwapParticipants: 'callback',
  },
  controlled: ['layoutMode', 'selectedMatchId', 'viewport'],
  state: (options: BracketOptions): BracketState => ({
    layoutMode: options.layoutMode ?? options.defaultLayoutMode ?? 'two-sided',
    selectedMatchId:
      options.selectedMatchId !== undefined
        ? options.selectedMatchId
        : (options.defaultSelectedMatchId ?? null),
    focusedSlotKey: null,
    viewport: options.viewport ?? options.defaultViewport ?? DEFAULT_VIEWPORT,
    readOnly: options.readOnly ?? false,
    thirdPlaceMatch: options.thirdPlaceMatch ?? false,
    matches: options.matches ?? [],
  }),
  sync: (options: BracketOptions) => {
    const patch: Partial<BracketState> = {
      matches: options.matches ?? [],
      readOnly: options.readOnly ?? false,
      thirdPlaceMatch: options.thirdPlaceMatch ?? false,
    };
    if (options.layoutMode !== undefined) {
      patch.layoutMode = options.layoutMode;
    }
    if (options.selectedMatchId !== undefined) {
      patch.selectedMatchId = options.selectedMatchId;
    }
    if (options.viewport !== undefined) {
      patch.viewport = options.viewport;
    }
    return patch;
  },
  api: (context) => {
    const change = createChange(context);
    const { store } = context;

    const currentLayout = (): BracketLayoutResult => {
      const s = store.get();
      return computeLayout(s.matches, s.thirdPlaceMatch, s.layoutMode);
    };

    const viewport = createViewport(context, {
      key: 'viewport',
      surface: () => context.element('surface') ?? context.element('root'),
      minZoom: () => MIN_ZOOM,
      maxZoom: () => MAX_ZOOM,
      set: (value, details) =>
        change('viewport', value, {
          reason: details.reason,
          event: details.event,
        }),
    });

    const roving = createRovingFocus<BracketState, BracketSlotPartProps>(
      context,
      {
        slot: 'slot',
        key: 'focusedSlotKey',
        move: (event, { from, rtl }) => {
          const layout = currentLayout();
          const current = layout.positions.find(
            (p) => p.match.id === from.props.matchId
          );
          if (!current) return from.key;

          if (event.key === 'ArrowDown' && from.props.side === 'red') {
            return slotKey(from.props.matchId, 'blue');
          }
          if (event.key === 'ArrowUp' && from.props.side === 'blue') {
            return slotKey(from.props.matchId, 'red');
          }

          const dirMap: Record<string, 'left' | 'right' | 'up' | 'down'> = {
            ArrowRight: rtl ? 'left' : 'right',
            ArrowLeft: rtl ? 'right' : 'left',
            ArrowDown: 'down',
            ArrowUp: 'up',
          };
          const dir = dirMap[event.key];
          if (!dir) return undefined;

          const next = findNextPositionInDirection(
            layout.positions,
            current,
            dir
          );
          if (!next) return from.key;

          const targetSide: BracketCorner =
            dir === 'down' ? 'red' : dir === 'up' ? 'blue' : from.props.side;
          const preferred = slotKey(next.match.id, targetSide);
          if (context.element('slot', preferred)) return preferred;
          return slotKey(next.match.id, 'red');
        },
      }
    );

    const recovery = createFocusRecovery<BracketSlotPartProps>({
      fallback: () => {
        const s = store.get();
        const first = s.matches.find((m) => m.kind !== 'custom');
        if (!first) return undefined;
        return context.element('slot', slotKey(first.id, 'red'));
      },
    });

    const setLayoutMode = (
      mode: BracketCanvasLayout,
      event?: Event
    ): boolean => {
      if (mode !== 'two-sided' && mode !== 'one-sided') return false;
      const ok = change('layoutMode', mode, {
        reason: event ? 'item-press' : 'layout-toggle',
        event,
      });
      if (ok) {
        const layout = computeLayout(
          store.get().matches,
          store.get().thirdPlaceMatch,
          mode
        );
        if (layout.width > 0 && layout.height > 0) {
          viewport.fit(
            { left: 0, top: 0, right: layout.width, bottom: layout.height },
            { padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM },
            { reason: 'imperative' }
          );
        }
      }
      return ok;
    };

    const selectMatch = (matchId: string | null, event?: Event): boolean => {
      const s = store.get();
      if (matchId !== null && !s.matches.some((m) => m.id === matchId)) {
        return false;
      }
      const ok = change('selectedMatchId', matchId, {
        reason: event ? 'item-press' : 'programmatic',
        event,
      });
      if (ok && matchId !== null) {
        const match = s.matches.find((m) => m.id === matchId);
        if (match) context.options().onSelectMatch?.(match);
      }
      return ok;
    };

    const toggleSlotLock = (
      matchId: string,
      side: BracketCorner,
      locked?: boolean
    ): boolean => {
      const s = store.get();
      if (s.readOnly) return false;
      const match = s.matches.find((m) => m.id === matchId);
      if (!match) return false;
      const currentLocked = side === 'red' ? match.redLocked : match.blueLocked;
      const nextLocked = locked ?? !currentLocked;
      context.options().onToggleLock?.(matchId, side, nextLocked);
      return true;
    };

    const assignSlot = (
      matchId: string,
      side: BracketCorner,
      tournamentAthleteId: string | null
    ): boolean => {
      const s = store.get();
      if (s.readOnly) return false;
      if (!s.matches.some((m) => m.id === matchId)) return false;
      context.options().onAssignSlot?.(matchId, side, tournamentAthleteId);
      return true;
    };

    const swapSlots = (
      matchAId: string,
      sideA: BracketCorner,
      matchBId: string,
      sideB: BracketCorner
    ): boolean => {
      const s = store.get();
      if (s.readOnly) return false;
      if (
        !s.matches.some((m) => m.id === matchAId) ||
        !s.matches.some((m) => m.id === matchBId)
      ) {
        return false;
      }
      context.options().onSwapSlots?.(matchAId, sideA, matchBId, sideB);
      return true;
    };

    const swapParticipants = (matchId: string): boolean => {
      const s = store.get();
      if (s.readOnly) return false;
      const match = s.matches.find((m) => m.id === matchId);
      if (!match || match.round === 0) return false;
      context.options().onSwapParticipants?.(matchId);
      return true;
    };

    const zoomIn = (): boolean =>
      viewport.zoomBy(1.15, undefined, { reason: 'imperative' });

    const zoomOut = (): boolean =>
      viewport.zoomBy(1 / 1.15, undefined, { reason: 'imperative' });

    const fitView = (): boolean => {
      const layout = currentLayout();
      if (layout.width <= 0 || layout.height <= 0) return false;
      return viewport.fit(
        { left: 0, top: 0, right: layout.width, bottom: layout.height },
        { padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM },
        { reason: 'imperative' }
      );
    };

    const revealMatch = (matchId: string): void => {
      const layout = currentLayout();
      const pos = layout.positions.find((p) => p.match.id === matchId);
      if (!pos) return;
      const card = getMatchCardGeometry(pos, layout.layoutMaxRound);
      viewport.reveal(card, { padding: 48 }, { reason: 'focus-in' });
    };

    const focusMatch = (matchId: string): boolean => {
      const layout = currentLayout();
      const pos = layout.positions.find((p) => p.match.id === matchId);
      if (!pos) return false;
      revealMatch(matchId);
      roving.focus(slotKey(matchId, 'red'));
      return true;
    };

    const listAgentItems = () => {
      const s = store.get();
      const opts = context.options();
      const athletes = opts.athleteMap ?? EMPTY_ATHLETES;
      const labels = opts.matchLabel ?? EMPTY_LABELS;
      const index = buildMatchIndex(s.matches);

      return s.matches
        .filter((m) => m.kind !== 'custom')
        .map((match) => {
          const resolved = resolveMatchSlots(match, index, athletes, labels);
          return {
            value: match.id,
            label: `${resolved.header} - Red: ${resolved.redDisplay}, Blue: ${resolved.blueDisplay}`,
          };
        });
    };

    return {
      viewport,
      roving,
      recovery,
      setLayoutMode,
      selectMatch,
      toggleSlotLock,
      assignSlot,
      swapSlots,
      swapParticipants,
      zoomIn,
      zoomOut,
      fitView,
      revealMatch,
      focusMatch,
      listAgentItems,
    };
  },
  slots: (slot) => ({
    root: slot({
      role: 'region',
      attrs: (state) => ({
        'data-layout': state.layoutMode,
        'data-readonly': state.readOnly ? '' : undefined,
      }),
    }),
    surface: slot({
      attrs: (state) => ({
        'data-layout': state.layoutMode,
      }),
      on: {
        wheel: (event, { api }) => {
          event.preventDefault();
          const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
          api.viewport.zoomBy(
            factor,
            { x: event.clientX, y: event.clientY },
            { reason: 'wheel', event }
          );
        },
        keydown: (event, { api }) => {
          if (event.key === '+' || event.key === '=') {
            event.preventDefault();
            api.zoomIn();
          } else if (event.key === '-') {
            event.preventDefault();
            api.zoomOut();
          } else if (event.key === '0') {
            event.preventDefault();
            api.fitView();
          }
        },
      },
    }),
    slot: slot<BracketSlotPartProps>({
      role: 'button',
      focus: 'roving',
      props: {
        value: 'string',
        matchId: 'string',
        side: 'string',
        round: 'number',
        matchIndex: 'number',
        wing: 'string',
      },
      selects: selects({
        focusedSlotKey: ({ key }) => [key, null],
        selectedMatchId: ({ props }) => [props.matchId, null],
      }),
      attrs: (state, part) => ({
        type: 'button',
        tabindex: part.api.roving.tabIndex(state, part),
        'aria-pressed': String(state.selectedMatchId === part.props.matchId),
        'data-selected':
          state.selectedMatchId === part.props.matchId ? '' : undefined,
        'data-side': part.props.side,
        'data-wing': part.props.wing,
      }),
      press: ({ api, props }, event) => api.selectMatch(props.matchId, event),
      on: {
        keydown: (event, { api, el, props }) => {
          if (event.key === 'l' || event.key === 'L') {
            if (api.toggleSlotLock(props.matchId, props.side)) {
              event.preventDefault();
            }
            return;
          }
          if (el) {
            const moved = api.roving.keydown(event, el);
            if (moved) {
              const parsed = parseSlotKey(moved.key);
              if (parsed) api.revealMatch(parsed.matchId);
              return;
            }
          }
          if (event.key === '+' || event.key === '=') {
            event.preventDefault();
            api.zoomIn();
          } else if (event.key === '-') {
            event.preventDefault();
            api.zoomOut();
          } else if (event.key === '0') {
            event.preventDefault();
            api.fitView();
          }
        },
      },
      bind: (el, part) => {
        void isRTL(el);
        const unbindRoving = part.api.roving.bind(el, part);
        const unbindRecovery = part.api.recovery.bind(el, part);
        return () => {
          unbindRoving();
          unbindRecovery();
        };
      },
    }),
    lockButton: slot<BracketLockButtonPartProps>({
      role: 'button',
      focus: 'native',
      props: {
        value: 'string',
        matchId: 'string',
        side: 'string',
        locked: 'boolean',
      },
      attrs: (state, part) => ({
        type: 'button',
        'aria-pressed': String(part.props.locked),
        'aria-disabled': state.readOnly ? 'true' : undefined,
        'data-locked': part.props.locked ? '' : undefined,
      }),
      press: ({ api, props }) =>
        api.toggleSlotLock(props.matchId, props.side, !props.locked),
    }),
  }),
  agent: {
    actions: [
      'selectMatch',
      'setLayoutMode',
      'toggleSlotLock',
      'assignSlot',
      'swapSlots',
      'swapParticipants',
      'zoomIn',
      'zoomOut',
      'fitView',
      'focusMatch',
    ],
    items: (api) => api.listAgentItems(),
  },
});
