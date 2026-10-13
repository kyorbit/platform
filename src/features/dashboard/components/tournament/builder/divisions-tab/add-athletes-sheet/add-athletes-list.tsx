import { Link } from '@tanstack/react-router';
import { ArrowRight, UserX, Users } from 'lucide-react';
import { AddAthleteProfileRow } from './add-athlete-profile-row';
import type { AddAthletesSheetState } from '@/features/dashboard/hooks/use-add-athletes-sheet';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

type ListView = 'pending' | 'emptyLibrary' | 'noResults' | 'ready';

function listView(list: AddAthletesSheetState['list']): ListView {
  if (list.isPending) return 'pending';
  if (list.emptyLibrary) return 'emptyLibrary';
  if (list.total === 0) return 'noResults';
  return 'ready';
}

function AthletesPending({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'text-muted-foreground flex items-center justify-center p-8',
        className
      )}
    >
      <Spinner />
    </div>
  );
}

function EmptyAthleteLibrary() {
  return (
    <Empty className="gap-2 p-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users />
        </EmptyMedia>
        <EmptyTitle>No athletes in your library yet.</EmptyTitle>
        <EmptyDescription>
          Add athletes to your library to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to="/dashboard/athletes" />}
        >
          Go to Athletes
          <ArrowRight data-icon="inline-end" />
        </Button>
      </EmptyContent>
    </Empty>
  );
}

interface AddAthletesListProps {
  list: AddAthletesSheetState['list'];
  virtual: AddAthletesSheetState['virtual'];
  selectedIds: Set<string>;
  onToggleProfile: (id: string) => void;
}

function NoAthletesFound({ description }: { description: string }) {
  return (
    <Empty className="gap-2 p-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UserX />
        </EmptyMedia>
        <EmptyTitle>No results found</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function AthletesRows({
  list,
  virtual,
  selectedIds,
  onToggleProfile,
}: AddAthletesListProps) {
  const { rowVirtualizer, virtualItems } = virtual;

  return (
    <div
      className="relative w-full"
      style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
    >
      {virtualItems.map((virtualRow) => {
        const profile = list.items[virtualRow.index];
        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            className="absolute top-0 left-0 w-full border-b"
            style={{ transform: `translateY(${virtualRow.start}px)` }}
          >
            {profile ? (
              <AddAthleteProfileRow
                profile={profile}
                checked={selectedIds.has(profile.id)}
                onToggle={() => onToggleProfile(profile.id)}
              />
            ) : (
              <AthletesPending className="h-15 p-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function noResultsCopy(list: AddAthletesSheetState['list']) {
  if (list.allInTournament) {
    return 'Everyone in your library is already in this tournament.';
  }
  if (list.hasFilters) {
    return 'No athletes match for your filters.';
  }
  return 'No athletes available to add.';
}

export function AddAthletesList(props: AddAthletesListProps) {
  const { list, virtual } = props;
  const view = listView(list);

  return (
    <div
      ref={virtual.scrollRef}
      className="min-h-0 flex-1 overflow-y-auto rounded-md border"
    >
      {
        {
          pending: <AthletesPending />,
          emptyLibrary: <EmptyAthleteLibrary />,
          noResults: <NoAthletesFound description={noResultsCopy(list)} />,
          ready: <AthletesRows {...props} />,
        }[view]
      }
    </div>
  );
}
