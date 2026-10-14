import React from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useCreateTournament } from '@/queries/tournament';

interface CreateTournamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export function CreateTournamentDialog({
  open,
  onOpenChange,
  children,
}: CreateTournamentDialogProps) {
  const [name, setName] = React.useState('');

  const mutation = useCreateTournament();

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName('');
          onOpenChange(false);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Tournament</DialogTitle>
            <DialogDescription>
              Enter a name for your new tournament. You'll be taken to the
              builder to set up divisions and matches.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Tournament name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim() || mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Spinner />
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon />
                  Create Tournament
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
