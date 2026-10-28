import type {
  ListTournamentAthletesResult,
  TournamentAthleteRow,
} from '@/contracts/rpc/tournament-athletes/dto';
import type {
  BulkRemoveTournamentAthletesCommand,
  ListTournamentAthletesQuery,
  RemoveTournamentAthleteCommand,
  UpdateTournamentAthleteCommand,
} from '../use-cases/roster-commands';

export type AthleteProfileRow = {
  id: string;
  name: string;
  gender: string;
  beltLevel: number;
  weight: number;
  affiliation: string;
  image: string | null;
};

export type CreatedProfileRow = AthleteProfileRow;

export type TournamentAthleteStore = {
  list: (
    query: ListTournamentAthletesQuery
  ) => Promise<ListTournamentAthletesResult>;
  findProfilesByIds: (ids: Array<string>) => Promise<Array<AthleteProfileRow>>;
  bulkCreate: (
    tournamentId: string,
    profiles: Array<AthleteProfileRow>
  ) => Promise<Array<CreatedProfileRow>>;
  update: (
    command: UpdateTournamentAthleteCommand
  ) => Promise<TournamentAthleteRow>;
  remove: (
    command: RemoveTournamentAthleteCommand
  ) => Promise<TournamentAthleteRow>;
  bulkRemove: (
    command: BulkRemoveTournamentAthletesCommand
  ) => Promise<{ removed: number }>;
  countAssigned: (
    tournamentId: string,
    profileIds: Array<string>
  ) => Promise<number>;
};
