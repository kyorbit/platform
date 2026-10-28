import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ContractInputs } from '@/contracts/rpc/router';
import type { MatchData } from '@/contracts/tournament/match';
import type { BracketDnDMutationContext } from '@/queries/optimistic-updates/match';
import { client } from '@/orpc/client';
import {
  applyOptimisticAssign,
  applyOptimisticSetLock,
  applyOptimisticSwap,
  applyOptimisticSwapParticipants,
  applyOptimisticUpdateScore,
  findMatchListQueryKey,
} from '@/queries/optimistic-updates/match';
import { invalidateAfterMatchWrite } from '@/queries/match/invalidate-match-cache';

function useInvalidateMatches() {
  const queryClient = useQueryClient();
  return () => invalidateAfterMatchWrite(queryClient);
}

export function useGenerateBracket(options?: { onSuccess?: () => void }) {
  const invalidate = useInvalidateMatches();

  return useMutation({
    mutationFn: (input: ContractInputs['bracket']['generate']) =>
      client.bracket.generate(input),
    onSuccess: () => {
      invalidate();
      options?.onSuccess?.();
    },
  });
}

export function useShuffleBracket(options?: { onSuccess?: () => void }) {
  const invalidate = useInvalidateMatches();

  return useMutation({
    mutationFn: (input: ContractInputs['bracket']['shuffle']) =>
      client.bracket.shuffle(input),
    onSuccess: () => {
      invalidate();
      options?.onSuccess?.();
    },
  });
}

export function useRegenerateBracket(options?: { onSuccess?: () => void }) {
  const invalidate = useInvalidateMatches();

  return useMutation({
    mutationFn: (input: ContractInputs['bracket']['regenerate']) =>
      client.bracket.regenerate(input),
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onSettled: () => {
      void invalidate();
    },
  });
}

export function useResetBracket(options?: { onSuccess?: () => void }) {
  const invalidate = useInvalidateMatches();

  return useMutation({
    mutationFn: (input: ContractInputs['bracket']['reset']) =>
      client.bracket.reset(input),
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onSettled: () => {
      void invalidate();
    },
  });
}

export function useCreateCustomMatch(options?: { onSuccess?: () => void }) {
  const invalidate = useInvalidateMatches();

  return useMutation({
    mutationFn: (input: ContractInputs['match']['createCustom']) =>
      client.match.createCustom(input),
    onSuccess: () => {
      invalidate();
      toast.success('Custom match created');
      options?.onSuccess?.();
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Request failed'),
  });
}

export function useAssignSlot(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMatches();

  return useMutation({
    mutationFn: (input: ContractInputs['match']['assignSlot']) =>
      client.match.assignSlot(input),
    onMutate: async (input): Promise<BracketDnDMutationContext | undefined> => {
      const queryKey = findMatchListQueryKey(queryClient, input.matchId);
      if (!queryKey) return undefined;

      await queryClient.cancelQueries({ queryKey });
      const previousMatches =
        queryClient.getQueryData<Array<MatchData>>(queryKey);
      queryClient.setQueryData<Array<MatchData>>(queryKey, (old) => {
        if (!old) return old;
        return applyOptimisticAssign(old, input);
      });
      return { queryKey, previousMatches };
    },
    onError: (_err, _input, context) => {
      if (context?.queryKey && context.previousMatches !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousMatches);
      }
    },
    onSettled: (_data, error) => {
      void invalidate();
      if (!error) options?.onSuccess?.();
    },
  });
}

export function useSwapSlots(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMatches();

  return useMutation({
    mutationFn: (input: ContractInputs['match']['swapSlots']) =>
      client.match.swapSlots(input),
    onMutate: async (input): Promise<BracketDnDMutationContext | undefined> => {
      const queryKey = findMatchListQueryKey(queryClient, input.matchAId);
      if (!queryKey) return undefined;

      await queryClient.cancelQueries({ queryKey });
      const previousMatches =
        queryClient.getQueryData<Array<MatchData>>(queryKey);
      queryClient.setQueryData<Array<MatchData>>(queryKey, (old) => {
        if (!old) return old;
        return applyOptimisticSwap(old, input);
      });
      return { queryKey, previousMatches };
    },
    onError: (_err, _input, context) => {
      if (context?.queryKey && context.previousMatches !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousMatches);
      }
    },
    onSettled: (_data, error) => {
      void invalidate();
      if (!error) options?.onSuccess?.();
    },
  });
}

export function useSetLock(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMatches();

  return useMutation({
    mutationFn: (input: ContractInputs['match']['setLock']) =>
      client.match.setLock(input),
    onMutate: async (input): Promise<BracketDnDMutationContext | undefined> => {
      const queryKey = findMatchListQueryKey(queryClient, input.matchId);
      if (!queryKey) return undefined;

      await queryClient.cancelQueries({ queryKey });
      const previousMatches =
        queryClient.getQueryData<Array<MatchData>>(queryKey);
      queryClient.setQueryData<Array<MatchData>>(queryKey, (old) => {
        if (!old) return old;
        return applyOptimisticSetLock(old, input);
      });
      return { queryKey, previousMatches };
    },
    onError: (err, _input, context) => {
      if (context?.queryKey && context.previousMatches !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousMatches);
      }
      toast.error(err.message);
    },
    onSettled: (_data, error) => {
      void invalidate();
      if (!error) options?.onSuccess?.();
    },
  });
}

export function useUpdateScore(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMatches();

  return useMutation({
    mutationFn: (input: ContractInputs['match']['updateScore']) =>
      client.match.updateScore(input),
    onMutate: async (input): Promise<BracketDnDMutationContext | undefined> => {
      const queryKey = findMatchListQueryKey(queryClient, input.matchId);
      if (!queryKey) return undefined;

      await queryClient.cancelQueries({ queryKey });
      const previousMatches =
        queryClient.getQueryData<Array<MatchData>>(queryKey);
      queryClient.setQueryData<Array<MatchData>>(queryKey, (old) => {
        if (!old) return old;
        return applyOptimisticUpdateScore(old, input);
      });
      return { queryKey, previousMatches };
    },
    onError: (err, _input, context) => {
      if (context?.queryKey && context.previousMatches !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousMatches);
      }
      toast.error(err.message);
    },
    onSettled: (_data, error) => {
      void invalidate();
      if (!error) {
        toast.success('Score updated');
        options?.onSuccess?.();
      }
    },
  });
}

export function useAdminSetMatchStatus(options?: { onSuccess?: () => void }) {
  const invalidate = useInvalidateMatches();

  return useMutation({
    mutationFn: (input: ContractInputs['match']['adminSetMatchStatus']) =>
      client.match.adminSetMatchStatus(input),
    onSuccess: () => {
      invalidate();
      toast.success('Match status updated');
      options?.onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useResetMatchScore(options?: { onSuccess?: () => void }) {
  const invalidate = useInvalidateMatches();

  return useMutation({
    mutationFn: (input: ContractInputs['match']['updateScore']) =>
      client.match.updateScore(input),
    onSuccess: () => {
      invalidate();
      toast.success('Match reset');
      options?.onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteMatch(options?: { onSuccess?: () => void }) {
  const invalidate = useInvalidateMatches();

  return useMutation({
    mutationFn: (input: ContractInputs['match']['delete']) =>
      client.match.delete(input),
    onSuccess: () => {
      invalidate();
      toast.success('Custom match deleted');
      options?.onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useSetWinner(options?: { onSuccess?: () => void }) {
  const invalidate = useInvalidateMatches();

  return useMutation({
    mutationFn: (input: ContractInputs['match']['setWinner']) =>
      client.match.setWinner(input),
    onSuccess: () => {
      invalidate();
      toast.success('Winner set');
      options?.onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useSwapParticipants(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMatches();

  return useMutation({
    mutationFn: (input: ContractInputs['match']['swapParticipants']) =>
      client.match.swapParticipants(input),
    onMutate: async (input): Promise<BracketDnDMutationContext | undefined> => {
      const queryKey = findMatchListQueryKey(queryClient, input.matchId);
      if (!queryKey) return undefined;

      await queryClient.cancelQueries({ queryKey });
      const previousMatches =
        queryClient.getQueryData<Array<MatchData>>(queryKey);
      queryClient.setQueryData<Array<MatchData>>(queryKey, (old) => {
        if (!old) return old;
        return applyOptimisticSwapParticipants(old, input);
      });
      return { queryKey, previousMatches };
    },
    onError: (err, _input, context) => {
      if (context?.queryKey && context.previousMatches !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousMatches);
      }
      toast.error(err.message);
    },
    onSettled: (_data, error) => {
      void invalidate();
      if (!error) options?.onSuccess?.();
    },
  });
}
