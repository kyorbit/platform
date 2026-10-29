import { type } from '@orpc/contract';
import {
  AthleteProfilesSchema,
  BulkDeleteAthleteProfilesSchema,
  CheckDuplicateSchema,
  CreateAthleteProfileSchema,
  UpdateAthleteProfileSchema,
} from './dto';
import type {
  AthleteProfile,
  AthleteProfilesPage,
} from '@/contracts/athlete-profiles/dto';
import type { DedupResult } from './dto';
import { ByIdSchema, access, base } from '@/contracts/base';

export const athleteProfileContract = {
  list: base
    .meta(access('member'))
    .input(AthleteProfilesSchema)
    .output(type<AthleteProfilesPage>()),
  create: base.input(CreateAthleteProfileSchema).output(type<AthleteProfile>()),
  checkDuplicate: base
    .meta(access('member'))
    .input(CheckDuplicateSchema)
    .output(type<DedupResult>()),
  update: base.input(UpdateAthleteProfileSchema).output(type<AthleteProfile>()),
  delete: base.input(ByIdSchema).output(type<AthleteProfile>()),
  bulkDelete: base
    .input(BulkDeleteAthleteProfilesSchema)
    .output(type<number>()),
};
