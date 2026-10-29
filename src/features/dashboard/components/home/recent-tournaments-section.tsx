import { HubSection, HubSectionContent } from './hub-panel';
import type { TournamentListItem } from '@/contracts/tournaments/dto';
import type { DataTableRowAction } from '@/lib/data-table/features';
import { useRecentTournamentsTable } from '@/features/dashboard/hooks/use-recent-tournaments-table';
import { DataTable } from '@/components/data-table/data-table';

interface RecentTournamentsSectionProps {
  tournaments: Array<TournamentListItem>;
  onRowAction: (action: DataTableRowAction<TournamentListItem>) => void;
}

export function RecentTournamentsSection({
  tournaments,
  onRowAction,
}: RecentTournamentsSectionProps) {
  const { table, tableState } = useRecentTournamentsTable(
    tournaments,
    onRowAction
  );

  return (
    <HubSection title="Recent tournaments">
      <HubSectionContent padded={false}>
        <DataTable
          table={table}
          state={tableState}
          selectedRows={false}
          pagination={false}
          className="gap-0"
        />
      </HubSectionContent>
    </HubSection>
  );
}
