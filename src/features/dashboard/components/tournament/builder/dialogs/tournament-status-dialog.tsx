import type { TournamentStatus } from '@/contracts/tournament/list';
import { StatusButton } from '@/components/async/status-button';
import {
  TOURNAMENT_STATUS_LABEL,
  tournamentStatusRiskNotes,
} from '@/lib/tournament/tournament-status';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TournamentStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentName: string;
  fromStatus: TournamentStatus;
  toStatus: TournamentStatus | null;
  isPending: boolean;
  onConfirm: () => void;
}

export function TournamentStatusDialog({
  open,
  onOpenChange,
  tournamentName,
  fromStatus,
  toStatus,
  isPending,
  onConfirm,
}: TournamentStatusDialogProps) {
  if (!toStatus) return null;

  const bullets = tournamentStatusRiskNotes(fromStatus, toStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Update tournament status?
          </DialogTitle>
          <DialogDescription className="text-base font-light">
            Tournament: <span className="font-semibold">{tournamentName}</span>{' '}
            <br />
            From{' '}
            <span className="font-semibold">
              {TOURNAMENT_STATUS_LABEL[fromStatus]}
            </span>{' '}
            to{' '}
            <span className="font-semibold">
              {TOURNAMENT_STATUS_LABEL[toStatus]}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="text-muted-foreground mb-2">
          <ul className="flex flex-col gap-1">
            {bullets.map((line, index) => (
              <span key={index} className="italic">
                {line}
              </span>
            ))}
          </ul>
        </div>
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
