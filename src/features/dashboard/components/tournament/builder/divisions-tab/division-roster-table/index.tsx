import { Settings } from 'lucide-react';
import { DivisionViolationBadge } from '../division-violation-badge';
import { DivisionRosterEmptyState } from './division-roster-empty-state';
import type { DivisionData } from '@/contracts/tournament/division';
import { useDivisionRosterTable } from '@/features/dashboard/hooks/use-division-roster-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Status, StatusIndicator, StatusLabel } from '@/components/ui/status';
import { DataTable } from '@/components/data-table/data-table';
import { getBeltLabel } from '@/config/athlete';
import { cn } from '@/lib/utils';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { SheetTrigger } from '@/components/ui/sheet';

function rosterView(showSkeleton: boolean, total: number) {
  if (showSkeleton) return 'skeleton';
  if (total === 0) return 'empty';
  return 'table';
}

export interface DivisionRosterTableProps {
  division: DivisionData | null;
  tournamentId: string;
  divisions: Array<DivisionData>;
  readOnly: boolean;
  prepareSettingsDivision: (division: DivisionData) => void;
}

export function DivisionRosterTable({
  division,
  tournamentId,
  divisions,
  readOnly,
  prepareSettingsDivision,
}: DivisionRosterTableProps) {
  return division ? (
    <DivisionRosterActive
      division={division}
      tournamentId={tournamentId}
      divisions={divisions}
      readOnly={readOnly}
      prepareSettingsDivision={prepareSettingsDivision}
    />
  ) : (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <DivisionRosterEmptyState variant="no-division-selected" />
    </div>
  );
}

interface DivisionRosterActiveProps extends Omit<
  DivisionRosterTableProps,
  'division'
> {
  division: DivisionData;
}

function DivisionRosterActive({
  division,
  tournamentId,
  divisions,
  readOnly,
  prepareSettingsDivision,
}: DivisionRosterActiveProps) {
  const roster = useDivisionRosterTable({
    division,
    tournamentId,
    divisions,
    readOnly,
  });

  const rosterBody = {
    skeleton: (
      <DataTableSkeleton
        columnCount={roster.columns.length}
        withViewOptions={false}
        withPagination={false}
        rowCount={10}
      />
    ),
    empty: (
      <DivisionRosterEmptyState
        variant="no-athletes"
        division={division}
        tournamentId={tournamentId}
        readOnly={readOnly}
      />
    ),
    table: (
      <DataTable
        table={roster.table}
        state={roster.tableState}
        selectedRows={false}
      />
    ),
  }[rosterView(roster.showRosterSkeleton, roster.total)];

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <div className="border-b px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold">{division.name}</h3>
          {division.gender && (
            <Badge variant="outline" className="text-xs">
              {division.gender === 'M' ? 'Male' : 'Female'}
            </Badge>
          )}
          {(division.beltMin != null || division.beltMax != null) && (
            <Badge variant="outline" className="text-xs">
              {getBeltLabel(division.beltMin ?? 0)}–
              {getBeltLabel(division.beltMax ?? 10)}
            </Badge>
          )}
          {(division.weightMin != null || division.weightMax != null) && (
            <Badge variant="outline" className="text-xs">
              {division.weightMin ?? 20}–{division.weightMax ?? 150}kg
            </Badge>
          )}
          <DivisionViolationBadge count={roster.violationCount} />

          <div className="ml-auto flex items-center gap-2">
            <Status status="online" className="h-6 px-1.5">
              <StatusIndicator />
              <StatusLabel>Ready</StatusLabel>
            </Status>
            {!readOnly && (
              <SheetTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 pointer-coarse:size-9"
                    onClick={() => prepareSettingsDivision(division)}
                  >
                    <Settings className="size-4" />
                  </Button>
                }
              />
            )}
          </div>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          {division._count.tournamentAthletes} athlete
          {division._count.tournamentAthletes === 1 ? '' : 's'} ·{' '}
          {roster.violationCount} violation
          {roster.violationCount === 1 ? '' : 's'} · Arena {division.arenaIndex}
        </p>
      </div>

      <div
        ref={roster.setNodeRef}
        className={cn(
          'flex-1 overflow-auto p-4',
          roster.isOver && 'bg-primary/5'
        )}
      >
        {rosterBody}
      </div>
    </div>
  );
}
