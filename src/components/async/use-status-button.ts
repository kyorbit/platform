import { useState } from 'react';
import type { ButtonStatus } from './status-button';

/** Follow a mutation without clearing its data when success feedback expires. */
export function useStatusButton(
  mutationStatus: 'idle' | 'pending' | 'success' | 'error'
) {
  const [previousStatus, setPreviousStatus] = useState(mutationStatus);
  const [status, setStatus] = useState<ButtonStatus>(
    mutationStatus === 'pending' ? 'loading' : 'idle'
  );

  if (mutationStatus !== previousStatus) {
    setPreviousStatus(mutationStatus);
    setStatus(
      mutationStatus === 'pending'
        ? 'loading'
        : mutationStatus === 'success'
          ? 'success'
          : 'idle'
    );
  }

  return { status, onStatusChange: setStatus };
}
