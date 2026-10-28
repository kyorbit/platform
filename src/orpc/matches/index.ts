import { NotFoundError } from '@/server/application/errors';
import {
  generateBracket as runGenerateBracket,
  regenerateBracket as runRegenerateBracket,
  resetBracket as runResetBracket,
  shuffleBracket as runShuffleBracket,
} from '@/server/application/matches/use-cases/bracket-lifecycle';
import {
  assignSlot as runAssignSlot,
  setLock as runSetLock,
  swapSlots as runSwapSlots,
} from '@/server/application/matches/use-cases/round0-slot';
import { swapParticipants as runSwapParticipants } from '@/server/application/matches/use-cases/swap-participants';
import {
  createCustomMatch as runCreateCustomMatch,
  deleteCustomMatch as runDeleteCustomMatch,
} from '@/server/application/matches/use-cases/custom';
import { authorized } from '@/orpc/middleware';
import {
  adminSetMatchStatus as runAdminSetMatchStatus,
  setMatchWinner as runSetMatchWinner,
  updateMatchScore as runUpdateMatchScore,
} from '@/server/application/matches/use-cases/transition';

export const listMatches = authorized.match.list.handler(
  async ({ input, context }) => {
    if (input.divisionId) {
      return await context.repos.matchRead.findByDivisionId(input.divisionId);
    }
    if (input.tournamentId) {
      return await context.repos.matchRead.findByTournamentId(
        input.tournamentId
      );
    }
    throw new NotFoundError('Either divisionId or tournamentId is required');
  }
);

export const getMatch = authorized.match.get.handler(
  async ({ input, context }) => {
    const match = await context.repos.matchRead.findById(input.id);
    if (!match) {
      throw new NotFoundError('Match not found');
    }
    return match;
  }
);

export const createCustomMatch = authorized.match.createCustom.handler(
  async ({ input, context }) => {
    return runCreateCustomMatch(
      { ...input, adminId: context.user.id },
      context.repos.customMatch
    );
  }
);

export const adminSetMatchStatus = authorized.match.adminSetMatchStatus.handler(
  async ({ input, context }) => {
    return runAdminSetMatchStatus(
      { ...input, adminId: context.user.id },
      context.repos.matchTransition
    );
  }
);

export const removeMatch = authorized.match.delete.handler(
  async ({ input, context }) => {
    return runDeleteCustomMatch(
      { matchId: input.id, adminId: context.user.id },
      context.repos.customMatch
    );
  }
);

export const generateBracket = authorized.bracket.generate.handler(
  async ({ input, context }) => {
    return runGenerateBracket(
      { ...input, adminId: context.user.id },
      context.repos.bracketLifecycle
    );
  }
);

export const shuffleBracket = authorized.bracket.shuffle.handler(
  async ({ input, context }) => {
    return runShuffleBracket(
      { ...input, adminId: context.user.id },
      context.repos.bracketLifecycle
    );
  }
);

export const regenerateBracket = authorized.bracket.regenerate.handler(
  async ({ input, context }) => {
    return runRegenerateBracket(
      { ...input, adminId: context.user.id },
      context.repos.bracketLifecycle
    );
  }
);

export const resetBracket = authorized.bracket.reset.handler(
  async ({ input, context }) => {
    return runResetBracket(
      { ...input, adminId: context.user.id },
      context.repos.bracketLifecycle
    );
  }
);

export const setLock = authorized.match.setLock.handler(
  async ({ input, context }) => {
    return runSetLock(input, context.repos.round0Slot);
  }
);

export const updateScore = authorized.match.updateScore.handler(
  async ({ input, context }) => {
    return runUpdateMatchScore(
      { ...input, adminId: context.user.id },
      context.repos.matchTransition
    );
  }
);

export const setWinner = authorized.match.setWinner.handler(
  async ({ input, context }) => {
    return runSetMatchWinner(
      { ...input, adminId: context.user.id },
      context.repos.matchTransition
    );
  }
);

export const swapParticipants = authorized.match.swapParticipants.handler(
  async ({ input, context }) => {
    return runSwapParticipants(
      { ...input, adminId: context.user.id },
      context.repos.matchParticipant
    );
  }
);

export const assignSlot = authorized.match.assignSlot.handler(
  async ({ input, context }) => {
    return runAssignSlot(
      { ...input, adminId: context.user.id },
      context.repos.round0Slot
    );
  }
);

export const swapSlots = authorized.match.swapSlots.handler(
  async ({ input, context }) => {
    return runSwapSlots(
      { ...input, adminId: context.user.id },
      context.repos.round0Slot
    );
  }
);
