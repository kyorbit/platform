import type {
  AthleteProfileRow,
  DedupMatch,
  ListAthleteProfilesResult,
} from '@/contracts/rpc/athlete-profiles/dto';
import type {
  BulkRemoveProfilesCommand,
  CreateProfileData,
  DedupQuery,
  ListAthleteProfilesQuery,
  UpdateProfileData,
} from '../use-cases/profile-commands';

export type AthleteProfileStore = {
  list: (query: ListAthleteProfilesQuery) => Promise<ListAthleteProfilesResult>;
  findById: (id: string) => Promise<AthleteProfileRow | null>;
  findByAthleteCodeAndName: (
    athleteCode: string,
    name: string,
    excludeId?: string
  ) => Promise<DedupMatch | null>;
  findPossibleDuplicates: (
    query: Omit<DedupQuery, 'athleteCode'>
  ) => Promise<Array<DedupMatch>>;
  create: (data: CreateProfileData) => Promise<AthleteProfileRow>;
  update: (id: string, data: UpdateProfileData) => Promise<AthleteProfileRow>;
  remove: (id: string) => Promise<AthleteProfileRow>;
  bulkRemove: (command: BulkRemoveProfilesCommand) => Promise<number>;
};
