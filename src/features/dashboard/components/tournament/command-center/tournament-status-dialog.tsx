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
import { useSetTournamentStatus } from '@/queries/tournament';

export type TournamentStatus = 'active' | 'completed';

export interface TournamentTransitionAction {
  label: string;
  title: string;
  description: string;
}

interface TournamentStatusDialogProps {
  tournamentId: string;
  confirmStatus: TournamentStatus | null;
  onConfirmStatusChange: (status: TournamentStatus | null) => void;
  transitionAction: TournamentTransitionAction | null;
}

export function TournamentStatusDialog({
  tournamentId,
  confirmStatus,
  onConfirmStatusChange,
  transitionAction,
}: TournamentStatusDialogProps) {
  const setStatusMutation = useSetTournamentStatus({
    onSuccess: () => onConfirmStatusChange(null),
  });

  return (
    <Dialog
      open={confirmStatus !== null}
      onOpenChange={(open) => {
        if (!open) {
          onConfirmStatusChange(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {transitionAction?.title ?? 'Update status'}
          </DialogTitle>
          <DialogDescription>
            {transitionAction?.description ??
              'Confirm the next tournament lifecycle transition.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onConfirmStatusChange(null)}
            disabled={setStatusMutation.isPending}
          >
            Cancel
          </Button>
          <StatusButton
            status={setStatusMutation.isPending ? 'loading' : 'idle'}
            onClick={() => {
              if (!confirmStatus) {
                return;
              }

              setStatusMutation.mutate({
                id: tournamentId,
                status: confirmStatus,
              });
            }}
          >
            {transitionAction?.label ?? 'Confirm'}
          </StatusButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
