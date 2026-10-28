import { type } from '@orpc/contract';
import { ListTournamentActivitySchema } from './dto';
import type { ActivityListPage } from './dto';
import { base } from '@/contracts/rpc/base';

export const activityContract = {
  listForTournament: base
    .input(ListTournamentActivitySchema)
    .output(type<ActivityListPage>()),
};
