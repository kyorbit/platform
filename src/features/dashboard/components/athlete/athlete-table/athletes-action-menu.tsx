import { toast } from 'sonner';
import {
  ChartNoAxesColumn,
  Mars,
  MoreHorizontal,
  Pencil,
  Trash2,
  Trophy,
} from 'lucide-react';
import React from 'react';

import type { AthleteProfileData } from '@/contracts/athlete/profile';
import type { ColumnOptions } from '@/features/dashboard/lib/athlete/column-options';
import type { DataTableRow } from '@/lib/data-table/features';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { BELT_LEVELS, GENDER_OPTIONS } from '@/config/athlete';
import {
  LAST_USED_TOURNAMENT_KEY,
  bulkAddAthleteResult,
} from '@/features/dashboard/lib/athlete/bulk-add-athletes';
import { useBulkAddAthletes } from '@/queries/tournament-athlete';
import { useTournaments } from '@/queries/tournament';
import { useUpdateAthleteProfile } from '@/queries/athlete-profile';

interface AthletesActionMenuProps {
  options: ColumnOptions;
  row: DataTableRow<AthleteProfileData>;
}

type GenderValue = (typeof GENDER_OPTIONS)[number]['value'];

export default function AthletesActionMenu({
  options,
  row,
}: AthletesActionMenuProps) {
  const [isUpdatePending, startUpdateTransition] = React.useTransition();
  const updateMutation = useUpdateAthleteProfile({ suppressToast: true });
  const bulkAddToTournament = useBulkAddAthletes({
    onSuccess: (result) => {
      bulkAddAthleteResult(result);
    },
  });

  const isUpdating =
    isUpdatePending ||
    updateMutation.isPending ||
    bulkAddToTournament.isPending;

  const onUpdate = React.useCallback(
    (updates: { gender?: GenderValue; beltLevel?: number }) => {
      startUpdateTransition(() => {
        toast.promise(
          updateMutation.mutateAsync({
            id: row.original.id,
            athleteCode: row.original.athleteCode,
            image: row.original.image,
            ...updates,
          }),
          {
            loading: 'Updating...',
            success: 'Athlete updated',
            error: (err) =>
              err instanceof Error ? err.message : 'Update failed',
          }
        );
      });
    },
    [
      row.original.athleteCode,
      row.original.id,
      startUpdateTransition,
      updateMutation,
    ]
  );

  const onQuickAddToTournament = React.useCallback(
    (tournamentId: string) => {
      localStorage.setItem(LAST_USED_TOURNAMENT_KEY, tournamentId);
      bulkAddToTournament.mutate({
        tournamentId,
        athleteProfileIds: [row.original.id],
        autoAssign: false,
      });
    },
    [bulkAddToTournament, row.original.id]
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="absolute inset-2 size-8"
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-42">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => options.onRowAction({ row, variant: 'update' })}
          >
            <Pencil className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={isUpdating}>
              <Mars className="mr-2 size-4" />
              Gender
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-center">
                  Choose gender
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={row.original.gender}
                  onValueChange={(value) => {
                    if (value === row.original.gender) return;
                    const genderValue = GENDER_OPTIONS.find(
                      (option) => option.value === value
                    )?.value;
                    if (!genderValue) return;
                    onUpdate({ gender: genderValue });
                  }}
                >
                  {GENDER_OPTIONS.map((gender) => (
                    <DropdownMenuRadioItem
                      key={gender.value}
                      value={gender.value}
                      disabled={isUpdating}
                      className="min-w-32"
                    >
                      {gender.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={isUpdating}>
              <ChartNoAxesColumn className="mr-2 size-4" />
              Belt level
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-center">
                  Choose belt level
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={String(row.original.beltLevel)}
                  onValueChange={(value) => {
                    const beltLevel = Number(value);
                    if (Number.isNaN(beltLevel)) return;
                    if (beltLevel === row.original.beltLevel) return;
                    onUpdate({ beltLevel });
                  }}
                >
                  {BELT_LEVELS.map((belt) => (
                    <DropdownMenuRadioItem
                      key={belt.value}
                      value={String(belt.value)}
                      disabled={isUpdating}
                      className="min-w-36"
                    >
                      {belt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={isUpdating}>
              <Trophy className="mr-2 size-4" />
              Tournaments
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-h-60 min-w-48 overflow-y-auto">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-center">
                  Add to tournaments
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <TournamentQuickAddItems
                  disabled={bulkAddToTournament.isPending}
                  onPick={onQuickAddToTournament}
                />
              </DropdownMenuGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => options.onRowAction({ row, variant: 'delete' })}
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TournamentQuickAddItems({
  disabled,
  onPick,
}: {
  disabled: boolean;
  onPick: (tournamentId: string) => void;
}) {
  const { data: tournaments, isPending } = useTournaments();

  if (isPending && !tournaments) {
    return (
      <div className="text-muted-foreground px-2 py-1.5 text-sm">Loading…</div>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="text-muted-foreground px-2 py-1.5 text-sm">
        No tournaments
      </div>
    );
  }

  return tournaments.map((t) => (
    <DropdownMenuItem
      key={t.id}
      disabled={disabled}
      className="cursor-pointer"
      onClick={() => onPick(t.id)}
    >
      <span className="truncate">{t.name}</span>
    </DropdownMenuItem>
  ));
}
