import React from 'react';
import { SearchX, UserPlus } from 'lucide-react';
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from 'nuqs';
import {
  PoolBeltFilter,
  PoolGenderSelect,
  PoolSearchInput,
  PoolWeightFilter,
} from './filters';
import { AthletePoolRow } from './athlete-pool-row';
import type { TournamentAthlete } from '@/contracts/tournament-athletes/dto';
import { useBuilderManagerQuery } from '@/features/dashboard/hooks/use-builder-manager-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTournamentAthletesInfinite } from '@/queries/tournament-athlete';
import { SheetTrigger } from '@/components/ui/sheet';
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

interface AthletePoolProps {
  tournamentId: string;
  selectedDivisionId: string | null;
  readOnly: boolean;
}

const POOL_FILTER_PARSERS = {
  q: parseAsString,
  poolGender: parseAsStringEnum(['M', 'F']),
  poolBeltMin: parseAsInteger,
  poolBeltMax: parseAsInteger,
  poolWeightMin: parseAsInteger,
  poolWeightMax: parseAsInteger,
};

export function AthletePool({
  tournamentId,
  selectedDivisionId,
  readOnly,
}: AthletePoolProps) {
  const {
    poolQuery,
    poolGender,
    poolBeltMin,
    poolBeltMax,
    poolWeightMin,
    poolWeightMax,
  } = useBuilderManagerQuery();
  const [, setFilters] = useQueryStates(POOL_FILTER_PARSERS);

  const query = useTournamentAthletesInfinite({
    tournamentId,
    unassignedOnly: true,
    perPage: 30,
    query: poolQuery ?? undefined,
    gender: poolGender ? [poolGender] : undefined,
    beltLevelMin: poolBeltMin ?? undefined,
    beltLevelMax: poolBeltMax ?? undefined,
    weightMin: poolWeightMin ?? undefined,
    weightMax: poolWeightMax ?? undefined,
    sorting: [],
  });

  const items = React.useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data]
  );
  const total = query.data?.pages[0]?.total ?? 0;
  const hasFilters =
    !!poolQuery ||
    !!poolGender ||
    poolBeltMin != null ||
    poolBeltMax != null ||
    poolWeightMin != null ||
    poolWeightMax != null;

  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (!query.hasNextPage || query.isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void query.fetchNextPage();
        }
      },
      { rootMargin: '120px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    query.hasNextPage,
    query.isFetchingNextPage,
    query.fetchNextPage,
    items.length,
  ]);

  return (
    <div className="bg-card flex w-xs shrink-0 flex-col overflow-hidden border-r">
      <div className="border-b p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Unassigned Athletes</h3>
            <Badge variant="secondary">{total}</Badge>
          </div>
          {!readOnly && (
            <SheetTrigger
              render={
                <Button size="sm" variant="outline">
                  <UserPlus data-icon="inline-start" aria-hidden="true" />
                  Athletes
                </Button>
              }
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <PoolSearchInput
            value={poolQuery}
            onChange={(q) => void setFilters({ q })}
          />

          <div className="flex gap-2">
            <PoolGenderSelect
              value={poolGender}
              onChange={(next) => void setFilters({ poolGender: next })}
            />
            <PoolBeltFilter
              poolBeltMin={poolBeltMin}
              poolBeltMax={poolBeltMax}
              onPatch={(patch) => void setFilters(patch)}
            />
            <PoolWeightFilter
              poolWeightMin={poolWeightMin}
              poolWeightMax={poolWeightMax}
              onPatch={(patch) => void setFilters(patch)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <PoolContent
          isPending={query.isPending}
          items={items}
          hasFilters={hasFilters}
          readOnly={readOnly}
          selectedDivisionId={selectedDivisionId}
          sentinelRef={sentinelRef}
          isFetchingNextPage={query.isFetchingNextPage}
        />
      </div>
    </div>
  );
}

interface PoolContentProps {
  isPending: boolean;
  items: Array<TournamentAthlete>;
  hasFilters: boolean;
  readOnly: boolean;
  selectedDivisionId: string | null;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
}

type PoolView = 'pending' | 'noMatches' | 'noAthletes' | 'list';
type PoolListProps = Omit<PoolContentProps, 'isPending' | 'hasFilters'>;

function poolView({
  isPending,
  itemCount,
  hasFilters,
}: Pick<PoolContentProps, 'isPending' | 'hasFilters'> & {
  itemCount: number;
}): PoolView {
  if (isPending) return 'pending';
  if (itemCount > 0) return 'list';
  if (hasFilters) return 'noMatches';
  return 'noAthletes';
}

function PoolPending() {
  return (
    <div className="flex flex-col gap-2 p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

function PoolNoMatches() {
  return (
    <Empty className="border-none p-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>No matches</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}

function AddFromLibraryTrigger() {
  return (
    <EmptyContent>
      <SheetTrigger
        data-slot="button"
        data-variant="default"
        render={
          <Button size="sm">
            <UserPlus data-icon="inline-start" aria-hidden="true" />
            Add from library
          </Button>
        }
      />
    </EmptyContent>
  );
}

function PoolNoAthletes({ children }: { children?: React.ReactNode }) {
  return (
    <Empty className="border-none p-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UserPlus />
        </EmptyMedia>
        <EmptyTitle>No unassigned athletes</EmptyTitle>
      </EmptyHeader>
      {children}
    </Empty>
  );
}

function PoolList({
  items,
  selectedDivisionId,
  readOnly,
  sentinelRef,
  isFetchingNextPage,
}: PoolListProps) {
  return (
    <>
      <div className="divide-y">
        {items.map((athlete) => (
          <AthletePoolRow
            key={athlete.id}
            athlete={athlete}
            selectedDivisionId={selectedDivisionId}
            readOnly={readOnly}
          />
        ))}
      </div>
      <div ref={sentinelRef} className="h-6">
        {isFetchingNextPage ? (
          <div className="text-muted-foreground p-2 text-center text-xs">
            Loading...
          </div>
        ) : null}
      </div>
    </>
  );
}

function PoolContent({
  isPending,
  hasFilters,
  ...listProps
}: PoolContentProps) {
  const view = poolView({
    isPending,
    itemCount: listProps.items.length,
    hasFilters,
  });

  return {
    pending: <PoolPending />,
    noMatches: <PoolNoMatches />,
    noAthletes: (
      <PoolNoAthletes>
        {!listProps.readOnly && <AddFromLibraryTrigger />}
      </PoolNoAthletes>
    ),
    list: <PoolList {...listProps} />,
  }[view];
}
