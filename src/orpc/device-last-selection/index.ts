import { authorized } from '@/orpc/middleware';
import { getLastSelection as runGetLastSelection } from '@/server/application/device-last-selection/use-cases/get';
import { setLastSelection as runSetLastSelection } from '@/server/application/device-last-selection/use-cases/set';

export const getLastSelection = authorized.device.lastSelection.get.handler(
  async ({ context, input }) =>
    runGetLastSelection(
      { userId: context.user.id, deviceId: input.deviceId },
      context.repos.deviceLastSelection
    )
);

export const setLastSelection = authorized.device.lastSelection.set.handler(
  async ({ context, input }) => {
    return runSetLastSelection(
      { userId: context.user.id, ...input },
      context.repos.deviceLastSelection
    );
  }
);
