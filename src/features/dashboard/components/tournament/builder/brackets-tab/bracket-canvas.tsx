'use client';

import React from 'react';
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { toast } from 'sonner';
import { BracketLayoutToggle } from './bracket-layout-toggle';
import { BracketViewToolbar } from './bracket-view-toolbar';
import type { TournamentAthlete } from '@/contracts/tournament-athletes/dto';
import type { BracketCorner } from '@/lib/tournament/bracket/bracket-layout/hit-test';
import type { BracketCanvasHandle } from '@/components/tournament-bracket/bracket';
import { useBracketChrome } from '@/features/dashboard/contexts/bracket-chrome';
import { useTournamentBracket } from '@/features/dashboard/contexts/tournament-bracket/use-tournament-bracket';
import { useBracketCanvasLayout } from '@/features/dashboard/hooks/use-bracket-canvas-layout';
import {
  Bracket,
  renderBracketToPng,
} from '@/components/tournament-bracket/bracket';
import { useBracketLayout } from '@/hooks/use-bracket-layout';
import {
  useAssignSlot,
  useSetLock,
  useSwapParticipants,
  useSwapSlots,
} from '@/queries/match';

const CANVAS_FIT_INSETS = { top: 48, left: 68, right: 60, bottom: 16 };

export function BracketCanvas() {
  const {
    matches,
    athletes,
    selectedDivision,
    selectedMatch,
    matchLabel,
    handleSlotClick,
    readOnly,
  } = useTournamentBracket();

  const setLock = useSetLock();
  const assignSlot = useAssignSlot();
  const swapSlots = useSwapSlots();
  const swapParticipants = useSwapParticipants();

  const thirdPlaceMatch = selectedDivision?.thirdPlaceMatch ?? false;
  const matchList = React.useMemo(
    () => matches.filter((m) => m.kind !== 'custom'),
    [matches]
  );

  const athleteMap = React.useMemo(() => {
    const map = new Map<string, TournamentAthlete>();
    for (const a of athletes) map.set(a.id, a);
    return map;
  }, [athletes]);

  const [layoutMode, setLayoutMode] = useBracketCanvasLayout();
  const { layout, connectors } = useBracketLayout(matchList, thirdPlaceMatch, {
    layoutMode,
  });

  const canvasRef = React.useRef<BracketCanvasHandle>(null);
  const { setCaptureTarget } = useBracketChrome();
  const [zoomPercent, setZoomPercent] = React.useState(100);
  const [dropTarget, setDropTarget] = React.useState<{
    matchId: string;
    side: BracketCorner;
  } | null>(null);

  const handleZoomChange = React.useCallback((zoom: number) => {
    setZoomPercent(Math.round(zoom * 100));
  }, []);

  React.useEffect(() => {
    if (selectedMatch?.id) {
      canvasRef.current?.revealMatch(selectedMatch.id);
    }
  }, [selectedMatch?.id]);

  const { setNodeRef: setDropRef } = useDroppable({
    id: 'bracket-canvas-drop',
    data: { from: 'canvas-drop' },
  });

  useDndMonitor({
    onDragMove(event) {
      const activator = event.activatorEvent as
        PointerEvent | MouseEvent | null;
      if (!activator || !canvasRef.current) return;
      const clientX = activator.clientX + event.delta.x;
      const clientY = activator.clientY + event.delta.y;
      const hit = canvasRef.current.hitTestClient(clientX, clientY);
      if (hit?.kind === 'slot') {
        const locked =
          hit.side === 'red'
            ? hit.pos.match.redLocked
            : hit.pos.match.blueLocked;
        if (!locked && hit.pos.match.status !== 'complete') {
          setDropTarget({ matchId: hit.matchId, side: hit.side });
          return;
        }
      }
      setDropTarget(null);
    },
    onDragCancel() {
      setDropTarget(null);
    },
    onDragEnd(event) {
      const target = dropTarget;
      setDropTarget(null);
      if (!target || readOnly) return;
      const src = event.active.data.current as
        { from?: string; tournamentAthleteId?: string } | undefined;
      if (src?.from === 'panel' && src.tournamentAthleteId) {
        assignSlot.mutate(
          {
            matchId: target.matchId,
            side: target.side,
            tournamentAthleteId: src.tournamentAthleteId,
          },
          {
            onError: (err) =>
              toast.error(err instanceof Error ? err.message : 'Assign failed'),
          }
        );
      }
    },
  });

  React.useEffect(() => {
    if (matchList.length === 0) {
      setCaptureTarget(null);
      return;
    }
    setCaptureTarget({
      renderPng: async () => {
        const result = await renderBracketToPng({
          matches: matchList,
          thirdPlaceMatch,
          layoutMode,
          athleteMap,
          matchLabel,
        });
        return result.blob;
      },
    });
    return () => setCaptureTarget(null);
  }, [
    matchList,
    thirdPlaceMatch,
    layoutMode,
    athleteMap,
    matchLabel,
    setCaptureTarget,
  ]);

  const handleLayoutModeChange = React.useCallback(
    (next: typeof layoutMode) => {
      setLayoutMode(next);
      canvasRef.current?.fitView();
    },
    [setLayoutMode]
  );

  const onToggleLock = React.useCallback(
    (matchId: string, side: BracketCorner, locked: boolean) => {
      setLock.mutate({ matchId, side, locked });
    },
    [setLock]
  );

  const onAssignSlot = React.useCallback(
    (
      matchId: string,
      side: BracketCorner,
      tournamentAthleteId: string | null
    ) => {
      assignSlot.mutate({ matchId, side, tournamentAthleteId });
    },
    [assignSlot]
  );

  const onSwapSlots = React.useCallback(
    (
      matchAId: string,
      sideA: BracketCorner,
      matchBId: string,
      sideB: BracketCorner
    ) => {
      swapSlots.mutate({ matchAId, sideA, matchBId, sideB });
    },
    [swapSlots]
  );

  const onSwapParticipants = React.useCallback(
    (matchId: string) => {
      const match = matchList.find((m) => m.id === matchId);
      if (!match) return;
      swapParticipants.mutate({
        matchId,
        redTournamentAthleteId: match.blueTournamentAthleteId ?? null,
        blueTournamentAthleteId: match.redTournamentAthleteId ?? null,
      });
    },
    [matchList, swapParticipants]
  );

  if (matchList.length === 0) return null;

  return (
    <div
      ref={setDropRef}
      className="relative size-full min-h-0 touch-none overflow-hidden pl-2"
    >
      <Bracket
        canvasRef={canvasRef}
        matches={matchList}
        thirdPlaceMatch={thirdPlaceMatch}
        layout={layout}
        connectors={connectors}
        layoutMode={layoutMode}
        onLayoutModeChange={handleLayoutModeChange}
        selectedMatchId={selectedMatch?.id ?? null}
        athleteMap={athleteMap}
        matchLabel={matchLabel}
        readOnly={readOnly}
        dropTarget={dropTarget}
        fitInsets={CANVAS_FIT_INSETS}
        onZoomChange={handleZoomChange}
        onSlotClick={handleSlotClick}
        onToggleLock={onToggleLock}
        onAssignSlot={onAssignSlot}
        onSwapSlots={onSwapSlots}
        onSwapParticipants={onSwapParticipants}
      />
      <BracketLayoutToggle
        value={layoutMode}
        onChange={handleLayoutModeChange}
      />
      <BracketViewToolbar
        onFit={() => canvasRef.current?.fitView()}
        onZoomIn={() => canvasRef.current?.zoomIn()}
        onZoomOut={() => canvasRef.current?.zoomOut()}
        onResetZoom={() => canvasRef.current?.resetZoom()}
        zoomPercent={zoomPercent}
      />
    </div>
  );
}
