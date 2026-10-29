import { type } from '@orpc/contract';
import { ListTournamentActivitySchema } from './dto';
import type { ActivityListPage } from './dto';
import { access, base } from '@/contracts/base';

export const activityContract = {
  listForTournament: base
    .meta(access('member'))
    .input(ListTournamentActivitySchema)
    .output(type<ActivityListPage>()),
};
