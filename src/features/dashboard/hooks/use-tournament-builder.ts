import React from 'react';
import { useBuilderManagerQuery } from './use-builder-manager-query';
import type { DivisionListItem } from '@/contracts/divisions/dto';
import type {
  TournamentDetail,
  TournamentStatus,
} from '@/contracts/tournaments/dto';
import { useTournamentReadOnly } from '@/hooks/use-tournament-read-only';
import { authClient } from '@/lib/auth-client';

export interface UseTournamentBuilderArgs {
  tournament: TournamentDetail;
  divisions: Array<DivisionListItem>;
  tournamentId: string;
}

export function useTournamentBuilder({
  tournament,
  divisions,
  tournamentId,
}: UseTournamentBuilderArgs) {
  void divisions;

  const isReadOnly = useTournamentReadOnly(tournamentId);
  const { tab, setTab } = useBuilderManagerQuery();

  const [activityOpen, setActivityOpen] = React.useState(false);
  const [showEditTournament, setShowEditTournament] = React.useState(false);
  const [showDeleteTournament, setShowDeleteTournament] = React.useState(false);
  const [showAutoAssignAll, setShowAutoAssignAll] = React.useState(false);
  const [pendingAdminStatus, setPendingAdminStatus] =
    React.useState<TournamentStatus | null>(null);
  const prevReadOnlyRef = React.useRef(isReadOnly);

  React.useEffect(() => {
    const wasEditable = !prevReadOnlyRef.current;
    prevReadOnlyRef.current = isReadOnly;
    if (!wasEditable || !isReadOnly) return;
    setShowEditTournament(false);
    setShowDeleteTournament(false);
    setShowAutoAssignAll(false);
    setPendingAdminStatus(null);
  }, [isReadOnly]);

  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;

  const handleAdminStatusIntent = React.useCallback(
    (target: TournamentStatus) => {
      if (target === tournament.status) return;
      setPendingAdminStatus(target);
    },
    [tournament.status]
  );

  return {
    isReadOnly,
    tab,
    setTab,
    activityOpen,
    setActivityOpen,
    showEditTournament,
    setShowEditTournament,
    showDeleteTournament,
    setShowDeleteTournament,
    showAutoAssignAll,
    setShowAutoAssignAll,
    pendingAdminStatus,
    setPendingAdminStatus,
    user,
    handleAdminStatusIntent,
  };
}
