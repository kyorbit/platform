import type { ActivityListPage } from '@/contracts/rpc/activity/dto';
import type { ListActivityQuery } from '../use-cases/list-commands';

export type ActivityListStore = {
  list: (query: ListActivityQuery) => Promise<ActivityListPage>;
};
