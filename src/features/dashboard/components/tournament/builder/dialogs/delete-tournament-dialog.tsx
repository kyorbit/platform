import { TrashIcon } from 'lucide-react';
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: string;
  tournamentName: string;
}

export function DeleteTournamentDialog({
  open,
  onOpenChange,
  tournamentId,
  tournamentName,
}: DeleteTournamentDialogProps) {
  const mutation = useDeleteTournament();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive text-lg">
            Delete Tournament
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete{' '}
              <b>&quot;{tournamentName}&quot;</b>?
            </p>
            <p>
              This will permanently remove all divisions, athletes, and matches.
              This action cannot be undone.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <StatusButton
            status={mutation.isPending ? 'loading' : 'idle'}
            variant="destructive"
            onClick={() => mutation.mutate({ id: tournamentId })}
          >
            <TrashIcon className="text-destructive" />
            Delete
          </StatusButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
