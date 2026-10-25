import { useDroppable } from '@dnd-kit/core';
import { BetweenHorizonalEnd } from 'lucide-react';
import { DivisionsPanelSkeleton } from '../skeletons';
import { ArenaOrderRailHint } from './arena-division-order-sheet/arena-order-rail-hint';
import { BracketActionQueue } from './bracket-action-queue';
import { DivisionsTabsHeader } from './divisions-tabs-header';
import { PanelAthleteRow } from './panel-athlete-row';
import type { TournamentAthleteData } from '@/contracts/tournament/division';
import { useTournamentBracket } from '@/features/dashboard/contexts/tournament-bracket/use-tournament-bracket';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { cn } from '@/lib/utils';

type PoolView =
  | 'loading'
  | 'athletes'
  | 'queue'
  | 'noAthletes'
  | 'arranged'
  | 'empty';

function poolView({
  isPoolLoading,
  athleteCount,
  matchCount,
  divisionAthleteCount,
  showArrangedHint,
}: {
  isPoolLoading: boolean;
  athleteCount: number;
  matchCount: number;
  divisionAthleteCount: number;
  showArrangedHint: boolean;
}): PoolView {
  if (isPoolLoading) return 'loading';
  if (athleteCount > 0) return 'athletes';
  if (matchCount > 0) return 'queue';
  if (divisionAthleteCount === 0) return 'noAthletes';
  if (showArrangedHint) return 'arranged';
  return 'empty';
}

function PanelAthletes({
  divisionName,
  athletes,
  divisionId,
  readOnly,
}: {
  divisionName: string | undefined;
  athletes: Array<TournamentAthleteData>;
  divisionId: string;
  readOnly: boolean;
}) {
  return (
    <>
      <header className="flex flex-col gap-1 px-0.5">
        <div className="flex items-center gap-2">
          <span
            className="bg-primary/80 size-1.5 shrink-0 rounded-full"
            aria-hidden
          />
          <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            {divisionName}
          </p>
        </div>
        <p className="text-muted-foreground text-xs leading-snug">
          Drag & drop athletes to bracket
        </p>
      </header>
      {athletes.map((athlete) => (
        <PanelAthleteRow
          key={athlete.id}
          athlete={athlete}
          divisionId={divisionId}
          readOnly={readOnly}
        />
      ))}
    </>
  );
}

function EmptyNoAthletes() {
  return (
    <Empty className="border-none px-2 py-8">
      <EmptyHeader>
        <EmptyTitle>No athletes in this division</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}

function EmptyAllArranged() {
  return (
    <Empty className="border-none px-2 py-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BetweenHorizonalEnd />
        </EmptyMedia>
        <EmptyTitle>All athletes are arranged</EmptyTitle>
        <EmptyDescription>
          Drag from the bracket here to remove an athlete.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function EmptyNoAthletesToShow() {
  return (
    <Empty className="border-none px-2 py-8">
      <EmptyHeader>
        <EmptyTitle>No athletes to show</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}

export function DivisionsPanel({ onSelect }: { onSelect?: () => void }) {
  const {
    divisions,
    arenaDivisionOrder,
    selectedDivisionId,
    setSelectedDivisionId,
    panelPoolAthletes,
    matches,
    readOnly,
    isDraft,
    setArenaOrderSheetOpen,
    slotReturnEnabled,
    athleteCount,
    isPoolLoading,
    showArrangedHint,
  } = useTournamentBracket();

  const poolDrop = useDroppable({
    id: `bracket-panel-pool-${selectedDivisionId ?? 'none'}`,
    disabled: readOnly || !selectedDivisionId || !slotReturnEnabled,
    data: {
      from: 'panel-drop' as const,
      divisionId: selectedDivisionId,
    },
  });

  const view = poolView({
    isPoolLoading,
    athleteCount: panelPoolAthletes.length,
    matchCount: matches.length,
    divisionAthleteCount: athleteCount,
    showArrangedHint,
  });

  const poolBody = {
    loading: <DivisionsPanelSkeleton showPanelHint={showArrangedHint} />,
    athletes: (
      <PanelAthletes
        divisionName={divisions.find((d) => d.id === selectedDivisionId)?.name}
        athletes={panelPoolAthletes}
        divisionId={selectedDivisionId ?? ''}
        readOnly={readOnly}
      />
    ),
    queue: <BracketActionQueue />,
    noAthletes: <EmptyNoAthletes />,
    arranged: <EmptyAllArranged />,
    empty: <EmptyNoAthletesToShow />,
  }[view];

  return (
    <div className="bg-card dark:bg-drawer flex h-full min-h-0 w-xs shrink-0 flex-col border-l shadow-sm">
      <DivisionsTabsHeader
        divisions={divisions}
        selectedDivisionId={selectedDivisionId}
        onSelect={(id) => {
          setSelectedDivisionId(id);
          onSelect?.();
        }}
      />
      <ArenaOrderRailHint
        divisions={divisions}
        arenaDivisionOrder={arenaDivisionOrder}
        isDraft={isDraft}
        readOnly={readOnly}
        onEdit={() => setArenaOrderSheetOpen(true)}
      />
      <div
        ref={poolDrop.setNodeRef}
        className={cn(
          'min-h-0 flex-1 overflow-y-auto transition-colors',
          poolDrop.isOver && slotReturnEnabled && !readOnly && 'bg-primary/5'
        )}
      >
        <div className="flex flex-col gap-1.5 p-2">{poolBody}</div>
      </div>
    </div>
  );
}
