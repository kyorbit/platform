import { Plus, SearchX, Trophy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { cn } from '@/lib/utils';

interface TournamentsEmptyStateProps {
  variant: 'no-data' | 'no-results';
  onClearFilters?: () => void;
  className?: string;
}

export function TournamentsEmptyState({
  variant,
  onClearFilters,
  className,
}: TournamentsEmptyStateProps) {
  if (variant === 'no-data') {
    return (
      <Empty className={cn('border pt-12!', className)}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Trophy />
          </EmptyMedia>
          <EmptyTitle>No tournaments yet</EmptyTitle>
          <EmptyDescription>
            Create your first tournament to get started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <DialogTrigger
            render={
              <Button size="sm">
                <Plus data-icon="inline-start" />
                New tournament
              </Button>
            }
          />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Empty className={cn('border pt-12!', className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>No tournaments match</EmptyTitle>
        <EmptyDescription>
          Try a different search term or status filter.
        </EmptyDescription>
      </EmptyHeader>
      {onClearFilters ? (
        <EmptyContent>
          <Button size="sm" variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
