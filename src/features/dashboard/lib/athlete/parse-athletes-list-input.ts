import {
  createLoader,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs/server';
import type {
  AthleteProfileListItem,
  AthleteProfilesDTO,
} from '@/contracts/athlete-profiles/dto';
import { ATHLETE_PROFILE_SORT_IDS } from '@/contracts/athlete-profiles/dto';
import { searchRecordToURLSearchParams } from '@/integrations/nuqs/tanstack-router-adapter';
import {
  getFiltersStateParser,
  getSortingStateParser,
} from '@/lib/data-table/parsers';
import { parseRangeParam } from '@/lib/data-table/utils';
import { DEFAULT_SORTING } from '@/config/athlete';
import { flagConfig } from '@/config/flag';

const ARRAY_SEPARATOR = ',';

const SORTABLE_COLUMN_IDS = new Set<string>(ATHLETE_PROFILE_SORT_IDS);

const FILTER_FLAG_VALUES = new Set(
  flagConfig.featureFlags.map((flag) => flag.value)
);

const loadAthletesSearch = createLoader({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  query: parseAsString,
  athleteCode: parseAsString,
  name: parseAsString,
  gender: parseAsArrayOf(parseAsString, ','),
  affiliation: parseAsString,
  beltLevel: parseAsArrayOf(parseAsString, ARRAY_SEPARATOR),
  weight: parseAsString,
  sort: getSortingStateParser<AthleteProfileListItem>(
    SORTABLE_COLUMN_IDS
  ).withDefault(DEFAULT_SORTING),
  filters: getFiltersStateParser<AthleteProfileListItem>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
});

function parseBeltLevelsFromQuery(
  values: Array<string> | null | undefined
): Array<number> | undefined {
  if (values == null || values.length === 0) return undefined;
  const nums = values
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 10);
  return nums.length > 0 ? [...new Set(nums)] : undefined;
}

function parseFilterFlag(
  value: string | null
): AthleteProfilesDTO['filterFlag'] {
  if (!value) return undefined;
  return FILTER_FLAG_VALUES.has(
    value as NonNullable<AthleteProfilesDTO['filterFlag']>
  )
    ? (value as NonNullable<AthleteProfilesDTO['filterFlag']>)
    : undefined;
}

/** Map router `location.search` → `AthleteProfilesDTO` (same shape as athlete table). */
export function parseAthletesListInput(
  search: Record<string, unknown>
): AthleteProfilesDTO {
  const params = searchRecordToURLSearchParams(search);
  const q = loadAthletesSearch(params);
  const weightRange = parseRangeParam(q.weight);
  const gender =
    q.gender && q.gender.length > 0
      ? (q.gender as NonNullable<AthleteProfilesDTO['gender']>)
      : undefined;

  return {
    page: q.page,
    perPage: q.perPage,
    query: q.query ?? undefined,
    athleteCode: q.athleteCode ?? undefined,
    name: q.name ?? undefined,
    gender,
    affiliation: q.affiliation ?? undefined,
    beltLevels: parseBeltLevelsFromQuery(q.beltLevel ?? undefined),
    weightMin: weightRange?.[0],
    weightMax: weightRange?.[1],
    sorting: q.sort as AthleteProfilesDTO['sorting'],
    filterFlag: parseFilterFlag(params.get('filterFlag')),
    filters: q.filters,
    joinOperator: q.joinOperator,
  };
}
