import type {
  AthleteProfile,
  AthleteProfilesPage,
  DedupMatch,
} from '@/contracts/athlete-profiles/dto';
import type {
  BulkRemoveProfilesCommand,
  CreateProfileData,
  DedupQuery,
  ListAthleteProfilesQuery,
  UpdateProfileData,
} from '../use-cases/profile-commands';

export type AthleteProfileStore = {
  list: (query: ListAthleteProfilesQuery) => Promise<AthleteProfilesPage>;
  findById: (id: string) => Promise<AthleteProfile | null>;
  findByAthleteCodeAndName: (
    athleteCode: string,
    name: string,
    excludeId?: string
  ) => Promise<DedupMatch | null>;
  findPossibleDuplicates: (
    query: Omit<DedupQuery, 'athleteCode'>
  ) => Promise<Array<DedupMatch>>;
  create: (data: CreateProfileData) => Promise<AthleteProfile>;
  update: (id: string, data: UpdateProfileData) => Promise<AthleteProfile>;
  remove: (id: string) => Promise<AthleteProfile>;
  bulkRemove: (command: BulkRemoveProfilesCommand) => Promise<number>;
};
