import type { AthleteProfileListItem } from '@/contracts/athlete-profiles/dto';
import type { DataTableRowAction } from '@/lib/data-table/features';

export type ColumnOptions = {
  onRowAction: (action: DataTableRowAction<AthleteProfileListItem>) => void;
  nameFilterQueryKey?: 'name' | 'query';
};
