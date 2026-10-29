import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ContractInputs } from '@/contracts/router';
import type { CheckDuplicateDTO } from '@/contracts/athlete-profiles/dto';
import { client } from '@/orpc/client';
import { invalidateAthleteProfileQueries } from '@/queries/athlete-profile/invalidate-athlete-profile-cache';

function useInvalidateAthleteProfiles() {
  const queryClient = useQueryClient();
  return () => invalidateAthleteProfileQueries(queryClient);
}

export function useCreateAthleteProfile(options?: {
  onSuccess?: () => void;
  onHardBlock?: () => void;
  onPossibleDuplicate?: (duplicateIds: Array<string>) => void;
}) {
  const invalidate = useInvalidateAthleteProfiles();

  return useMutation({
    mutationFn: (input: ContractInputs['athleteProfile']['create']) =>
      client.athleteProfile.create(input),
    onSuccess: () => {
      invalidate();
      options?.onSuccess?.();
    },
    onError: (err) => {
      const message = err.message ?? '';
      if (message.startsWith('DUPLICATE_ATHLETE_CODE_NAME:')) {
        options?.onHardBlock?.();
        return;
      }
      if (message.startsWith('POSSIBLE_DUPLICATE:')) {
        try {
          const ids = JSON.parse(
            message.replace('POSSIBLE_DUPLICATE: ', '')
          ) as Array<string>;
          options?.onPossibleDuplicate?.(ids);
        } catch {
          options?.onPossibleDuplicate?.([]);
        }
      }
    },
  });
}

export function useCheckDuplicate() {
  return useMutation({
    mutationFn: (data: CheckDuplicateDTO) =>
      client.athleteProfile.checkDuplicate(data),
  });
}

export function useUpdateAthleteProfile(options?: {
  onSuccess?: () => void;
  suppressToast?: boolean;
}) {
  const invalidate = useInvalidateAthleteProfiles();

  return useMutation({
    mutationFn: (input: ContractInputs['athleteProfile']['update']) =>
      client.athleteProfile.update(input),
    onSuccess: () => {
      invalidate();
      if (!options?.suppressToast) {
        toast.success('Athlete updated');
      }
      options?.onSuccess?.();
    },
    onError: (err) => {
      if (!options?.suppressToast) {
        toast.error(err.message);
      }
    },
  });
}

export function useDeleteAthleteProfile(options?: { onSuccess?: () => void }) {
  const invalidate = useInvalidateAthleteProfiles();

  return useMutation({
    mutationFn: (input: ContractInputs['athleteProfile']['delete']) =>
      client.athleteProfile.delete(input),
    onSuccess: () => {
      invalidate();
      toast.success('Athlete deleted');
      options?.onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useBulkDeleteAthleteProfiles(options?: {
  onSuccess?: () => void;
}) {
  const invalidate = useInvalidateAthleteProfiles();

  return useMutation({
    mutationFn: (input: ContractInputs['athleteProfile']['bulkDelete']) =>
      client.athleteProfile.bulkDelete(input),
    onSuccess: (deletedCount) => {
      invalidate();
      toast.success(
        deletedCount === 1
          ? 'Athlete deleted'
          : `${deletedCount} athletes deleted`
      );
      options?.onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });
}

type BulkSave =
  | { kind: 'create'; rows: Array<ContractInputs['athleteProfile']['create']> }
  | { kind: 'update'; rows: Array<ContractInputs['athleteProfile']['update']> };

/** Saves rows in parallel; one row failing does not fail the batch. */
export function useBulkSaveAthleteProfiles() {
  const invalidate = useInvalidateAthleteProfiles();

  return useMutation({
    mutationFn: async (batch: BulkSave) => {
      const results = await Promise.allSettled(
        batch.kind === 'create'
          ? batch.rows.map((row) => client.athleteProfile.create(row))
          : batch.rows.map((row) => client.athleteProfile.update(row))
      );
      const successCount = results.filter(
        (r) => r.status === 'fulfilled'
      ).length;
      return { successCount, failCount: results.length - successCount };
    },
    onSuccess: () => invalidate(),
  });
}
