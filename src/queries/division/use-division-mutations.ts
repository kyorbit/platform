import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ContractInputs } from '@/contracts/router';
import { client } from '@/orpc/client';
import { invalidateAfterDivisionWrite } from '@/queries/division/invalidate-division-cache';

function useInvalidateDivisions() {
  const queryClient = useQueryClient();
  return (tournamentId?: string) =>
    invalidateAfterDivisionWrite(queryClient, tournamentId);
}

export function useCreateDivision(options?: { onSuccess?: () => void }) {
  const invalidate = useInvalidateDivisions();

  return useMutation({
    mutationFn: (input: ContractInputs['division']['create']) =>
      client.division.create(input),
    onSuccess: (_data, variables) => {
      invalidate(variables.tournamentId);
      toast.success('Division created');
      options?.onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateDivision(options?: { onSuccess?: () => void }) {
  const invalidate = useInvalidateDivisions();

  return useMutation({
    mutationFn: (input: ContractInputs['division']['update']) =>
      client.division.update(input),
    onSuccess: () => {
      invalidate();
      toast.success('Division updated');
      options?.onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteDivision(options?: { onSuccess?: () => void }) {
  const invalidate = useInvalidateDivisions();

  return useMutation({
    mutationFn: (input: ContractInputs['division']['delete']) =>
      client.division.delete(input),
    onSuccess: () => {
      invalidate();
      toast.success('Division deleted');
      options?.onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useAutoAssignDivision(options?: {
  onSuccess?: () => void;
  suppressToast?: boolean;
}) {
  const invalidate = useInvalidateDivisions();

  return useMutation({
    mutationFn: (input: ContractInputs['division']['autoAssign']) =>
      client.division.autoAssign(input),
    onSuccess: (result) => {
      invalidate();
      if (!options?.suppressToast) {
        toast.success(`Auto-assigned ${result.assigned} athletes`);
      }
      options?.onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useAutoAssignAll(options?: {
  onSuccess?: (result: {
    assigned: number;
    divisionsRun: number;
    divisionsSkipped: number;
  }) => void;
}) {
  const invalidate = useInvalidateDivisions();

  return useMutation({
    mutationFn: (input: ContractInputs['division']['autoAssignAll']) =>
      client.division.autoAssignAll(input),
    onSuccess: (result) => {
      invalidate();
      options?.onSuccess?.(result);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useAssignAthlete(options?: {
  onSuccess?: () => void;
  suppressErrorToast?: boolean;
}) {
  const invalidate = useInvalidateDivisions();

  return useMutation({
    mutationFn: (input: ContractInputs['division']['assignAthlete']) =>
      client.division.assignAthlete(input),
    onSuccess: () => {
      invalidate();
      options?.onSuccess?.();
    },
    onError: (err) => {
      if (!options?.suppressErrorToast) toast.error(err.message);
    },
  });
}

export function useUnassignAthlete(options?: {
  onSuccess?: () => void;
  suppressErrorToast?: boolean;
}) {
  const invalidate = useInvalidateDivisions();

  return useMutation({
    mutationFn: (input: ContractInputs['division']['unassignAthlete']) =>
      client.division.unassignAthlete(input),
    onSuccess: () => {
      invalidate();
      options?.onSuccess?.();
    },
    onError: (err) => {
      if (!options?.suppressErrorToast) toast.error(err.message);
    },
  });
}
