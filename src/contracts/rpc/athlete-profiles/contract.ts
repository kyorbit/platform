import { type } from '@orpc/contract';
import {
  AthleteProfilesSchema,
  BulkDeleteAthleteProfilesSchema,
  CheckDuplicateSchema,
  CreateAthleteProfileSchema,
  UpdateAthleteProfileSchema,
} from './dto';
import type {
  AthleteProfileRow,
  DedupResult,
  ListAthleteProfilesResult,
} from './dto';
import { ByIdSchema, base } from '@/contracts/rpc/base';

export const athleteProfileContract = {
  list: base
    .input(AthleteProfilesSchema)
    .output(type<ListAthleteProfilesResult>()),
  create: base
    .input(CreateAthleteProfileSchema)
    .output(type<AthleteProfileRow>()),
  checkDuplicate: base.input(CheckDuplicateSchema).output(type<DedupResult>()),
  update: base
    .input(UpdateAthleteProfileSchema)
    .output(type<AthleteProfileRow>()),
  delete: base.input(ByIdSchema).output(type<AthleteProfileRow>()),
  bulkDelete: base
    .input(BulkDeleteAthleteProfilesSchema)
    .output(type<number>()),
};
