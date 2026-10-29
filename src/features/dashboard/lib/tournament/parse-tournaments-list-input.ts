import {
  createLoader,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs/server';
import type {
  ListTournamentsDTO,
  TournamentListItem,
  TournamentSortField,
} from '@/contracts/tournaments/dto';
import { searchRecordToURLSearchParams } from '@/integrations/nuqs/tanstack-router-adapter';
import { getSortingStateParser } from '@/lib/data-table/parsers';

const SORTABLE_COLUMN_IDS = new Set([
  'name',
  'status',
  'athletes',
  'createdAt',
]);

const loadTournamentsSearch = createLoader({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(20),
  query: parseAsString,
  name: parseAsString,
  status: parseAsArrayOf(
    parseAsStringEnum(['draft', 'active', 'completed']),
    ','
  ),
  sort: getSortingStateParser<TournamentListItem>(
    SORTABLE_COLUMN_IDS
  ).withDefault([{ id: 'createdAt', desc: true }]),
});

/** Map router `location.search` → `ListTournamentsDTO` (same shape as tournaments grid). */
export function parseTournamentsListInput(
  search: Record<string, unknown>
): ListTournamentsDTO {
  const q = loadTournamentsSearch(searchRecordToURLSearchParams(search));
  const primarySort = q.sort[0];

  return {
    page: q.page,
    perPage: q.perPage,
    query: q.query ?? undefined,
    name: q.name ?? undefined,
    status:
      q.status && q.status.length > 0
        ? (q.status as NonNullable<ListTournamentsDTO['status']>)
        : undefined,
    sort: primarySort?.id as TournamentSortField | undefined,
    // Match grid/table: empty sort still yields sortDir 'asc' (ternary on undefined desc).
    sortDir: primarySort?.desc ? 'desc' : 'asc',
  };
}
