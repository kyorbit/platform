import React from 'react';
import { UserPlus, Users } from 'lucide-react';
import { StatusButton } from '@/components/async/status-button';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LAST_USED_TOURNAMENT_KEY,
  bulkAddAthleteResult,
} from '@/features/dashboard/lib/athlete/bulk-add-athletes';
import { useBulkAddAthletes } from '@/queries/tournament-athlete';
import { useTournaments } from '@/queries/tournament';
import { Spinner } from '@/components/ui/spinner';

interface BulkAddAthletesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athleteProfileIds: Array<string>;
  onSuccess?: () => void;
}

export function BulkAddAthletesDialog({
  open,
  onOpenChange,
  athleteProfileIds,
  onSuccess,
}: BulkAddAthletesDialogProps) {
  const [tournamentId, setTournamentId] = React.useState<string>('');
  const [autoAssign, setAutoAssign] = React.useState(false);

  const bulkAdd = useBulkAddAthletes({
    onSuccess: (result) => {
      bulkAddAthleteResult(result);
      onSuccess?.();
      onOpenChange(false);
    },
  });

  function onSubmit() {
    if (!tournamentId) return;
    localStorage.setItem(LAST_USED_TOURNAMENT_KEY, tournamentId);
    bulkAdd.mutate({ tournamentId, athleteProfileIds, autoAssign });
  }

  function onClose(isOpen: boolean) {
    if (!isOpen) {
      setAutoAssign(false);
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Tournament</DialogTitle>
          <DialogDescription>
            Add{' '}
            <span className="font-semibold">
              {athleteProfileIds.length} selected athlete
              {athleteProfileIds.length !== 1 ? 's' : ''}
            </span>{' '}
            to a tournament.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Tournament</Label>
            <TournamentSelect
              open={open}
              tournamentId={tournamentId}
              onTournamentIdChange={setTournamentId}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="autoAssign"
              checked={autoAssign}
              onCheckedChange={(v) => setAutoAssign(!!v)}
            />
            <Label htmlFor="autoAssign" className="cursor-pointer font-normal">
              Auto-assign by group constraints
            </Label>
          </div>

          {autoAssign && (
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Users className="size-3.5 shrink-0" />
              Athletes will be placed in groups matching their gender, belt, and
              weight. Unmatched athletes go to the unassigned pool.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <StatusButton
            disabled={!tournamentId}
            status={bulkAdd.isPending ? 'loading' : 'idle'}
            onClick={onSubmit}
          >
            <UserPlus />
            <span>Add to Tournament</span>
          </StatusButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TournamentSelect({
  open,
  tournamentId,
  onTournamentIdChange,
}: {
  open: boolean;
  tournamentId: string;
  onTournamentIdChange: (id: string) => void;
}) {
  const { data: tournaments, isPending } = useTournaments();

  React.useEffect(() => {
    if (!open || !tournaments) return;
    const lastUsed = localStorage.getItem(LAST_USED_TOURNAMENT_KEY);
    if (lastUsed && tournaments.some((t) => t.id === lastUsed)) {
      onTournamentIdChange(lastUsed);
    }
  }, [open, tournaments, onTournamentIdChange]);

  if (isPending && !tournaments) {
    return (
      <div className="text-muted-foreground flex h-9 items-center gap-2 text-sm">
        <Spinner className="size-4" />
        Loading tournaments…
      </div>
    );
  }

  const items = tournaments ?? [];

  return (
    <Select
      items={items.map((t) => ({ value: t.id, label: t.name }))}
      value={tournamentId}
      onValueChange={(value) => value !== null && onTournamentIdChange(value)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a tournament..." />
      </SelectTrigger>
      <SelectContent>
        {items.length === 0 ? (
          <div className="text-muted-foreground px-2 py-4 text-center text-sm">
            No tournaments found
          </div>
        ) : (
          items.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
