import React from 'react';
import { Link } from '@tanstack/react-router';
import { CheckCircle2, Edit, History, ZapIcon } from 'lucide-react';
import { TournamentActivitySheet } from '../tournament-activity-sheet';
import { TournamentStatusPill } from '../tournament-status-pill';
import { ActivityPanel } from './activity-panel';
import { DivisionsOverview } from './divisions-overview';
import {
  ActivityPanelSkeleton,
  DivisionsOverviewSkeleton,
  SetupChecklistSkeleton,
  TournamentKpiRowSkeleton,
} from './loading';
import { SetupChecklist } from './setup-checklist';
import { TournamentKpiRow } from './tournament-kpi-row';
import { TournamentStatusDialog } from './tournament-status-dialog';
import type { TournamentStatus } from './tournament-status-dialog';
import type { DivisionData } from '@/contracts/tournament/division';
import type { MatchData } from '@/contracts/tournament/match';
import type { TournamentData } from '@/contracts/tournament/list';
import { ErrorBoundary } from '@/components/error-boundary';
import { useTournamentCommandCenter } from '@/features/dashboard/hooks/use-tournament-command-center';
import { DashboardHeaderContent } from '@/features/dashboard/components/sidebar/dashboard-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useDivisions } from '@/queries/division';
import { useTournamentMatches } from '@/queries/match';
import { useTournament } from '@/queries/tournament';

interface TournamentCommandCenterProps {
  tournamentId: string;
}

export function TournamentCommandCenter({
  tournamentId,
}: TournamentCommandCenterProps) {
  const { data } = useTournament(tournamentId);
  const tournament = data as TournamentData;

  const [activityOpen, setActivityOpen] = React.useState(false);
  const [confirmStatus, setConfirmStatus] =
    React.useState<TournamentStatus | null>(null);

  const transitionAction =
    tournament.status === 'draft'
      ? {
          status: 'active' as const,
          label: 'Activate',
          title: 'Activate tournament',
          description:
            'This will move the tournament into the active state so live results can begin.',
        }
      : tournament.status === 'active' && tournament.lifecycle.canComplete
        ? {
            status: 'completed' as const,
            label: 'Complete tournament',
            title: 'Complete tournament',
            description:
              'This will mark the tournament as completed and make the tournament workspace read-only.',
          }
        : null;

  const isDraft = tournament.status === 'draft';

  return (
    <div className="flex h-full flex-col">
      <DashboardHeaderContent breadcrumb={tournament.name}>
        <div className="ml-auto flex items-center gap-2">
          <TournamentStatusPill status={tournament.status} />
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setActivityOpen(true)}
          >
            <History data-icon="inline-start" />
            Activity
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link
                to="/dashboard/tournaments/$id/builder"
                params={{ id: tournamentId }}
              />
            }
          >
            <Edit data-icon="inline-start" />
            Open Builder
          </Button>
          {transitionAction && (
            <Button
              size="sm"
              onClick={() => setConfirmStatus(transitionAction.status)}
            >
              <ZapIcon aria-hidden="true" />
              {transitionAction.label}
            </Button>
          )}
        </div>
      </DashboardHeaderContent>

      <div className="flex-1 overflow-auto p-6">
        <main className="mx-auto flex max-w-7xl flex-col gap-6">
          <h1 className="sr-only">{tournament.name} command center</h1>

          {tournament.status === 'active' &&
            tournament.lifecycle.canComplete && (
              <Alert>
                <CheckCircle2 aria-hidden="true" />
                <AlertTitle>Ready to complete</AlertTitle>
                <AlertDescription>
                  Every match has a recorded winner. You can complete this
                  tournament when you are ready to lock the workspace.
                </AlertDescription>
              </Alert>
            )}

          {isDraft ? (
            <ErrorBoundary title="Failed to load setup checklist">
              <React.Suspense fallback={<SetupChecklistSkeleton />}>
                <SetupChecklistIsland tournamentId={tournamentId} />
              </React.Suspense>
            </ErrorBoundary>
          ) : null}

          <ErrorBoundary title="Failed to load tournament stats">
            <React.Suspense fallback={<TournamentKpiRowSkeleton />}>
              <TournamentKpiRowIsland tournamentId={tournamentId} />
            </React.Suspense>
          </ErrorBoundary>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="flex flex-col gap-4 lg:col-span-3">
              <ErrorBoundary title="Failed to load divisions">
                <React.Suspense fallback={<DivisionsOverviewSkeleton />}>
                  <DivisionsOverviewIsland tournamentId={tournamentId} />
                </React.Suspense>
              </ErrorBoundary>
            </div>
            <div className="lg:col-span-2">
              <ErrorBoundary title="Failed to load activity">
                <React.Suspense fallback={<ActivityPanelSkeleton />}>
                  <ActivityPanel
                    tournamentId={tournamentId}
                    onViewAll={() => setActivityOpen(true)}
                  />
                </React.Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </main>
      </div>

      <TournamentActivitySheet
        tournamentId={tournamentId}
        open={activityOpen}
        onOpenChange={setActivityOpen}
      />

      <TournamentStatusDialog
        tournamentId={tournamentId}
        confirmStatus={confirmStatus}
        onConfirmStatusChange={setConfirmStatus}
        transitionAction={transitionAction}
      />
    </div>
  );
}

function SetupChecklistIsland({ tournamentId }: { tournamentId: string }) {
  const { data: tournamentData } = useTournament(tournamentId);
  const { data: matchesData } = useTournamentMatches(tournamentId);
  const tournament = tournamentData as TournamentData;
  const matches = matchesData as Array<MatchData>;
  const commandCenter = useTournamentCommandCenter({
    tournament,
    matches,
  });

  if (commandCenter.setupSteps.length === 0) {
    return null;
  }

  return (
    <SetupChecklist
      steps={commandCenter.setupSteps}
      tournamentId={tournamentId}
    />
  );
}

function TournamentKpiRowIsland({ tournamentId }: { tournamentId: string }) {
  const { data: tournamentData } = useTournament(tournamentId);
  const { data: divisionsData } = useDivisions(tournamentId);
  const { data: matchesData } = useTournamentMatches(tournamentId);

  return (
    <TournamentKpiRow
      tournament={tournamentData as TournamentData}
      divisions={divisionsData as Array<DivisionData>}
      matches={matchesData as Array<MatchData>}
    />
  );
}

function DivisionsOverviewIsland({ tournamentId }: { tournamentId: string }) {
  const { data: divisionsData } = useDivisions(tournamentId);
  const { data: matchesData } = useTournamentMatches(tournamentId);

  return (
    <DivisionsOverview
      divisions={divisionsData as Array<DivisionData>}
      matches={matchesData as Array<MatchData>}
      tournamentId={tournamentId}
    />
  );
}
