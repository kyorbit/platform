'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@ui-sdk/react/alert-dialog';
import type { AgentAction } from '@ui-sdk/react/agent';
import { mountBracketAgentTools } from '@/features/dashboard/lib/tournament/bracket-agent-bridge';

interface PendingConfirm {
  step: AgentAction;
  resolve: (approved: boolean) => void;
}

export function AgentConfirmDialog() {
  const [pending, setPending] = React.useState<PendingConfirm | null>(null);

  React.useEffect(() => {
    return mountBracketAgentTools(
      (step, { signal }) =>
        new Promise<boolean>((resolve) => {
          if (signal.aborted) {
            resolve(false);
            return;
          }
          const onAbort = () => {
            setPending((curr) => (curr?.step === step ? null : curr));
            resolve(false);
          };
          signal.addEventListener('abort', onAbort, { once: true });
          setPending({
            step,
            resolve: (approved) => {
              signal.removeEventListener('abort', onAbort);
              setPending(null);
              resolve(approved);
            },
          });
        })
    );
  }, []);

  return (
    <AlertDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open && pending) pending.resolve(false);
      }}
    >
      <AlertDialogContent
        data-agent-hidden=""
        className="bg-background fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-lg"
      >
        <AlertDialogTitle className="text-base font-semibold">
          Confirm agent action
        </AlertDialogTitle>
        <AlertDialogDescription className="text-muted-foreground mt-2 text-sm">
          {pending?.step.confirm ?? 'An AI agent requested a protected action.'}
        </AlertDialogDescription>
        <div className="mt-6 flex justify-end gap-2">
          <AlertDialogClose
            value="cancel"
            className="border-input bg-background hover:bg-accent inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium"
            onClick={() => pending?.resolve(false)}
          >
            Cancel
          </AlertDialogClose>
          <AlertDialogClose
            value="confirm"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium"
            onClick={() => pending?.resolve(true)}
          >
            Approve action
          </AlertDialogClose>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
