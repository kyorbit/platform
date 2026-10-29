import { TrashIcon } from 'lucide-react';
import type { TournamentListItem } from '@/contracts/tournaments/dto';
import { StatusButton } from '@/components/async/status-button';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteTournament } from '@/queries/tournament';

interface DeleteTournamentDialogProps {
  tournament: TournamentListItem | null;
  onClose: () => void;
}

export function DeleteTournamentDialog({
  tournament,
  onClose,
}: DeleteTournamentDialogProps) {
  const mutation = useDeleteTournament({
    navigateAway: false,
    onSuccess: onClose,
  });

  return (
    <Dialog
      open={!!tournament}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive text-lg">
            Delete Tournament
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              Delete <span className="font-semibold">{tournament?.name}</span>?
            </p>
            <p>
              This removes all of its divisions, matches, and athlete
              participations. This action cannot be undone.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <StatusButton
            status={mutation.isPending ? 'loading' : 'idle'}
            variant="destructive"
            onClick={() => {
              if (tournament) mutation.mutate({ id: tournament.id });
            }}
          >
            <TrashIcon className="text-destructive" />
            Delete
          </StatusButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
