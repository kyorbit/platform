import type { AthleteProfile } from '@/contracts/athlete-profiles/dto';
import type {
  TournamentAthlete,
  TournamentAthletesPage,
} from '@/contracts/tournament-athletes/dto';
import type {
  BulkRemoveTournamentAthletesCommand,
  ListTournamentAthletesQuery,
  RemoveTournamentAthleteCommand,
  UpdateTournamentAthleteCommand,
} from '../use-cases/roster-commands';

/** Profile fields copied onto a TournamentAthlete when it joins a tournament. */
export type ProfileSnapshot = Pick<
  AthleteProfile,
  'id' | 'name' | 'gender' | 'beltLevel' | 'weight' | 'affiliation' | 'image'
>;

export type TournamentAthleteStore = {
  list: (query: ListTournamentAthletesQuery) => Promise<TournamentAthletesPage>;
  findProfilesByIds: (ids: Array<string>) => Promise<Array<ProfileSnapshot>>;
  bulkCreate: (
    tournamentId: string,
    profiles: Array<ProfileSnapshot>
  ) => Promise<Array<ProfileSnapshot>>;
  update: (
    command: UpdateTournamentAthleteCommand
  ) => Promise<TournamentAthlete>;
  remove: (
    command: RemoveTournamentAthleteCommand
  ) => Promise<TournamentAthlete>;
  bulkRemove: (
    command: BulkRemoveTournamentAthletesCommand
  ) => Promise<{ removed: number }>;
  countAssigned: (
    tournamentId: string,
    profileIds: Array<string>
  ) => Promise<number>;
};
