import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { StatusButton } from '@/components/async/status-button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateTournament } from '@/queries/tournament';

interface CreateTournamentDialogProps {
  children: React.ReactNode;
}

export function CreateTournamentDialog({
  children,
}: CreateTournamentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [triggerId, setTriggerId] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');

  const navigate = useNavigate();
  const mutation = useCreateTournament();

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!name.trim() || mutation.isPending) return;
    mutation.mutate(
      { name: name.trim() },
      {
        onSuccess: (tournament) => {
          setName('');
          setOpen(false);
          void navigate({
            to: '/dashboard/tournaments/$id',
            params: { id: tournament.id },
          });
        },
      }
    );
  }

  return (
    <Dialog
      open={open}
      triggerId={triggerId}
      onOpenChange={(nextOpen, eventDetails) => {
        if (!nextOpen && mutation.isPending) {
          eventDetails.cancel();
          return;
        }
        setOpen(nextOpen);
        setTriggerId(eventDetails.trigger?.id ?? null);
        if (!nextOpen) {
          setName('');
          mutation.reset();
        }
      }}
    >
      {children}
      <DialogContent showCloseButton={!mutation.isPending}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Tournament</DialogTitle>
            <DialogDescription>
              Enter a name for your new tournament. After creating it, you'll be
              taken to its detail page.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Tournament name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              disabled={mutation.isPending}
            />
          </div>
          <DialogFooter>
            <StatusButton
              disabled={!name.trim()}
              status={mutation.isPending ? 'loading' : 'idle'}
              type="submit"
            >
              <PlusIcon data-icon="inline-start" />
              Create Tournament
            </StatusButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
