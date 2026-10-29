import { createRouterClient } from '@orpc/server';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { createIsomorphicFn } from '@tanstack/react-start';

import type { ContractClient } from '@/contracts/router';

import router from '@/orpc/router';
import { serverRepos } from '@/server/composition';

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(router, {
      context: () => ({
        headers: getRequestHeaders(),
        repos: serverRepos,
      }),
    })
  )
  .client((): ContractClient => {
    const link = new RPCLink({
      url: '/api/rpc',
    });
    return createORPCClient(link);
  });

export const client: ContractClient = getORPCClient();
