import React from 'react';
import { TournamentActivitySheet } from '../tournament-activity-sheet';
import { BuilderShell } from './builder-shell';
import { BuilderHeader } from './builder-shell/builder-header';
import { BuilderFooter } from './builder-shell/builder-footer';
import { EditTournamentDialog } from './dialogs/edit-tournament-dialog';
import { DeleteTournamentDialog } from './dialogs/delete-tournament-dialog';
import { AutoAssignAllDialog } from './dialogs/auto-assign-all-dialog';
import { TournamentStatusDialog } from './dialogs/tournament-status-dialog';
import { DivisionsTab } from './divisions-tab';
import { BracketsTab } from './brackets-tab';
import type { DivisionData } from '@/contracts/tournament/division';
import type { TournamentData } from '@/contracts/tournament/list';
import LoadingScreen from '@/components/navigation/loading';
import { ErrorBoundary } from '@/components/error-boundary';
import { TournamentBracketProvider } from '@/features/dashboard/contexts/tournament-bracket';
import { useTournamentBuilder } from '@/features/dashboard/hooks/use-tournament-builder';
import { BuilderWorkspaceProvider } from '@/features/dashboard/contexts/builder-workspace';
import {
  BracketChromeProvider,
  useBracketChrome,
} from '@/features/dashboard/contexts/bracket-chrome';
import { useTournamentRealtimeStream } from '@/hooks/use-tournament-realtime-stream';
import { useSetTournamentStatus, useTournament } from '@/queries/tournament';
import { useDivisions } from '@/queries/division';

interface TournamentBuilderProps {
  id: string;
}

export function TournamentBuilder({ id }: TournamentBuilderProps) {
  useTournamentRealtimeStream(id);

  const { data } = useTournament(id);
  const tournament = data as TournamentData;

  return (
    <ErrorBoundary title="Failed to load divisions">
      <React.Suspense fallback={<LoadingScreen title="Loading workspace..." />}>
        <TournamentBuilderDivisions tournament={tournament} tournamentId={id} />
      </React.Suspense>
    </ErrorBoundary>
  );
}

function BracketsTabIsland() {
  return (
    <ErrorBoundary title="Failed to load brackets">
      <React.Suspense fallback={<LoadingScreen title="Loading brackets..." />}>
        <TournamentBracketProvider>
          <BracketsTab />
        </TournamentBracketProvider>
      </React.Suspense>
    </ErrorBoundary>
  );
}

function TournamentBuilderDivisions({
  tournament,
  tournamentId,
}: {
  tournament: TournamentData;
  tournamentId: string;
}) {
  const { data: divisions } = useDivisions(tournamentId);

  return (
    <TournamentBuilderActive
      tournament={tournament}
      divisions={divisions}
      tournamentId={tournamentId}
    />
  );
}

interface TournamentBuilderActiveProps {
  tournament: TournamentData;
  divisions: Array<DivisionData>;
  tournamentId: string;
}

function TournamentBuilderActive({
  tournament,
  divisions,
  tournamentId,
}: TournamentBuilderActiveProps) {
  return (
    <BracketChromeProvider>
      <TournamentBuilderActiveBody
        tournament={tournament}
        divisions={divisions}
        tournamentId={tournamentId}
      />
    </BracketChromeProvider>
  );
}

function TournamentBuilderActiveBody({
  tournament,
  divisions,
  tournamentId,
}: TournamentBuilderActiveProps) {
  const b = useTournamentBuilder({ tournament, divisions, tournamentId });
  const { exitFullscreen } = useBracketChrome();

  React.useEffect(() => {
    if (b.tab !== 'brackets') exitFullscreen();
  }, [b.tab, exitFullscreen]);

  const setTournamentStatusMutation = useSetTournamentStatus({
    onSuccess: () => b.setPendingAdminStatus(null),
  });

  return (
    <BuilderShell
      readOnly={b.isReadOnly}
      header={
        <BuilderHeader
          tournament={tournament}
          tab={b.tab}
          onTabChange={(v) => {
            if (v === 'divisions') exitFullscreen();
            void b.setTab(v);
          }}
          user={b.user}
        />
      }
      footer={
        <BuilderFooter
          tournament={tournament}
          readOnly={b.isReadOnly}
          isSettingTournamentStatus={setTournamentStatusMutation.isPending}
          onRefresh={b.handleRefresh}
          onAutoAssignAll={() => b.setShowAutoAssignAll(true)}
          onAdminStatusIntent={b.handleAdminStatusIntent}
          onEditTournament={() => {
            if (!b.isReadOnly) b.setShowEditTournament(true);
          }}
          onDeleteTournament={() => {
            if (!b.isReadOnly) b.setShowDeleteTournament(true);
          }}
          onActivity={() => b.setActivityOpen(true)}
        />
      }
    >
      <BuilderWorkspaceProvider
        tournamentId={tournamentId}
        divisions={divisions}
        readOnly={b.isReadOnly}
        tournamentStatus={tournament.status}
      >
        <div className="relative flex-1 overflow-hidden">
          {b.tab === 'divisions' ? (
            <DivisionsTab
              tournamentId={tournamentId}
              tournamentName={tournament.name}
              divisions={divisions}
              readOnly={b.isReadOnly}
            />
          ) : (
            <BracketsTabIsland />
          )}
        </div>
      </BuilderWorkspaceProvider>

      <TournamentActivitySheet
        open={b.activityOpen}
        onOpenChange={b.setActivityOpen}
        tournamentId={tournamentId}
      />
      <EditTournamentDialog
        open={b.showEditTournament}
        onOpenChange={b.setShowEditTournament}
        tournamentId={tournamentId}
        currentName={tournament.name}
      />
      <DeleteTournamentDialog
        open={b.showDeleteTournament}
        onOpenChange={b.setShowDeleteTournament}
        tournamentId={tournamentId}
        tournamentName={tournament.name}
      />
      <AutoAssignAllDialog
        open={b.showAutoAssignAll}
        onOpenChange={b.setShowAutoAssignAll}
        tournamentId={tournamentId}
        divisions={divisions}
      />
      <TournamentStatusDialog
        open={b.pendingAdminStatus !== null}
        onOpenChange={(open) => {
          if (!open) b.setPendingAdminStatus(null);
        }}
        tournamentName={tournament.name}
        fromStatus={tournament.status}
        toStatus={b.pendingAdminStatus}
        isPending={setTournamentStatusMutation.isPending}
        onConfirm={() => {
          if (!b.pendingAdminStatus) return;
          setTournamentStatusMutation.mutate({
            id: tournamentId,
            status: b.pendingAdminStatus,
            force: true,
          });
        }}
      />
    </BuilderShell>
  );
}
