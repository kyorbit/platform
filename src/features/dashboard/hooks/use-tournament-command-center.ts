import { useMemo } from 'react';
import type { Match } from '@/contracts/matches/dto';
import type { TournamentDetail } from '@/contracts/tournaments/dto';
import { computeCommandCenter } from '@/features/dashboard/lib/tournament/compute-command-center';

export function useTournamentCommandCenter(input: {
  tournament: TournamentDetail | undefined;
  matches: Array<Match>;
}) {
  return useMemo(() => {
    if (!input.tournament) {
      return { setupSteps: [] };
    }

    return computeCommandCenter({
      tournament: input.tournament,
      matches: input.matches,
    });
  }, [input.tournament, input.matches]);
}
