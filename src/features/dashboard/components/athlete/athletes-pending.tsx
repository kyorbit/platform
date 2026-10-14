import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';

const ATHLETE_TABLE_COLUMN_COUNT = 8;

/** Route pending UI — outlet swaps immediately instead of holding the previous page. */
export function AthletesPending() {
  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto w-full max-w-7xl p-6">
        <DataTableSkeleton
          className="pt-6"
          columnCount={ATHLETE_TABLE_COLUMN_COUNT}
          filterCount={2}
        />
      </div>
    </div>
  );
}
