import { queryOptions } from '@tanstack/react-query';
import type { ListTournamentAthletesDTO } from '@/contracts/rpc/tournament-athletes/dto';
import { client } from '@/orpc/client';
import { tournamentAthleteKeys } from '@/queries/keys';

export function tournamentAthletesQueryOptions(
  input: ListTournamentAthletesDTO
) {
  return queryOptions({
    queryKey: tournamentAthleteKeys.list(input),
    queryFn: () => client.tournamentAthlete.list(input),
  });
}
