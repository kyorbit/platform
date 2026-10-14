import { Trash2 } from 'lucide-react';
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

interface DeleteCustomMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => void;
}

export function DeleteCustomMatchDialog({
  open,
  onOpenChange,
  isPending,
  onConfirm,
}: DeleteCustomMatchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive text-lg">
            Delete this match?
          </DialogTitle>
          <DialogDescription>
            This custom match will be removed from the bracket. This cannot be
            undone.
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
            variant="destructive"
            onClick={onConfirm}
          >
            <Trash2 data-icon="inline-start" />
            Delete match
          </StatusButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
