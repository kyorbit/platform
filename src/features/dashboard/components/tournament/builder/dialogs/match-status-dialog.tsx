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

interface MatchStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Human label for the status being applied (e.g. "Pending"). */
  targetStatusLabel: string;
  isPending: boolean;
  onConfirm: () => void;
}

export function MatchStatusDialog({
  open,
  onOpenChange,
  targetStatusLabel,
  isPending,
  onConfirm,
}: MatchStatusDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change match status?</DialogTitle>
          <DialogDescription>
            Scores and declared winner for this match will be cleared when
            moving to {targetStatusLabel || 'the selected status'}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <StatusButton
            status={isPending ? 'loading' : 'idle'}
            onClick={onConfirm}
          >
            Confirm
          </StatusButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
