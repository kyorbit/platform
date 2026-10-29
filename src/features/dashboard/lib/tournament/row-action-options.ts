import type { TournamentListItem } from '@/contracts/tournaments/dto';
import type { DataTableRowAction } from '@/lib/data-table/features';

export interface TournamentRowActionOptions {
  onRowAction: (action: DataTableRowAction<TournamentListItem>) => void;
  resolveTournament?: (id: string) => TournamentListItem | undefined;
}
