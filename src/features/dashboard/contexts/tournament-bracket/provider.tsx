import React from 'react';
import { useRouterState } from '@tanstack/react-router';
import { useBuilderWorkspace } from '../builder-workspace/use-builder-workspace';
import { TournamentBracketContext } from './context';
import type { Match } from '@/contracts/matches/dto';
import type { TournamentBracketContextValue } from './context';
import { useBuilderManagerQuery } from '@/features/dashboard/hooks/use-builder-manager-query';
import { useBracketsTabDnd } from '@/features/dashboard/hooks/use-brackets-tab-dnd';
import { useBracketsTabQueries } from '@/features/dashboard/hooks/use-brackets-tab-queries';

export interface TournamentBracketProviderProps {
  children: React.ReactNode;
}

export function TournamentBracketProvider({
  children,
}: TournamentBracketProviderProps) {
  const { tournamentId, divisions, readOnly, tournamentStatus } =
    useBuilderWorkspace();
  const { selectedDivisionId, setSelectedDivision: setSelectedDivisionId } =
    useBuilderManagerQuery();
  const isOnBuilder = useRouterState({
    select: (s) => s.location.pathname.endsWith('/builder'),
  });

  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(null);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [arenaOrderSheetOpen, setArenaOrderSheetOpen] = React.useState(false);

  React.useEffect(() => {
    // Only write while still on the builder. During exit, Link clears search
    // first; writing here would reattach ?division= onto Command Center.
    if (!isOnBuilder) return;
    if (!selectedDivisionId && divisions.length > 0) {
      void setSelectedDivisionId(divisions[0]!.id);
    }
    if (
      selectedDivisionId &&
      !divisions.find((d) => d.id === selectedDivisionId)
    ) {
      void setSelectedDivisionId(divisions[0]?.id ?? null);
    }
  }, [isOnBuilder, divisions, selectedDivisionId, setSelectedDivisionId]);

  const data = useBracketsTabQueries({
    tournamentId,
    divisions,
    selectedDivisionId,
    tournamentStatus,
    readOnly,
  });

  const { sensors, dragLabel, onDragStart, onDragEnd } = useBracketsTabDnd(
    data.athletes
  );

  const matchDetail = React.useMemo(() => {
    if (!selectedMatch) return null;
    return data.matches.find((m) => m.id === selectedMatch.id) ?? selectedMatch;
  }, [data.matches, selectedMatch]);

  const handleSlotClick = React.useCallback((match: Match) => {
    setSelectedMatch(match);
    setPanelOpen(true);
  }, []);

  const isDraft = tournamentStatus === 'draft';

  const slotReturnEnabled = data.matches.length > 0;
  const showArrangedHint =
    slotReturnEnabled && !readOnly && data.athleteCount > 0;

  const value = React.useMemo((): TournamentBracketContextValue => {
    return {
      ...data,
      sensors,
      dragLabel,
      onDragStart,
      onDragEnd,
      tournamentId,
      divisions,
      readOnly,
      tournamentStatus,
      isDraft,
      selectedDivisionId,
      setSelectedDivisionId,
      selectedMatch,
      setSelectedMatch,
      panelOpen,
      setPanelOpen,
      arenaOrderSheetOpen,
      setArenaOrderSheetOpen,
      handleSlotClick,
      matchDetail,
      slotReturnEnabled,
      showArrangedHint,
    };
  }, [
    data,
    sensors,
    dragLabel,
    onDragStart,
    onDragEnd,
    tournamentId,
    divisions,
    readOnly,
    tournamentStatus,
    isDraft,
    selectedDivisionId,
    selectedMatch,
    panelOpen,
    arenaOrderSheetOpen,
    handleSlotClick,
    matchDetail,
    slotReturnEnabled,
    showArrangedHint,
  ]);

  return (
    <TournamentBracketContext.Provider value={value}>
      {children}
    </TournamentBracketContext.Provider>
  );
}
