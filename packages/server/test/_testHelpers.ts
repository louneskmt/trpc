/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createTRPCClient, CreateTRPCClientOptions } from '../../client/src';
import AbortController from 'abort-controller';
import fetch from 'node-fetch';
import { AnyRouter, CreateHttpHandlerOptions } from '../src';
import { CreateHttpContextFn, createHttpServer } from '../src/standalone';

export function routerToServerAndClient<
  TRouter extends AnyRouter,
  TContext = {}
>(
  router: TRouter,
  opts?: {
    createContext?: CreateHttpContextFn<TContext>;
    getHeaders?: CreateTRPCClientOptions['getHeaders'];
    subscriptions?: CreateHttpHandlerOptions<any, any>['subscriptions'];
  },
) {
  const server = createHttpServer({
    router,
    createContext: opts?.createContext ?? (() => ({})),
    subscriptions: opts?.subscriptions,
  });
  const { port } = server.listen(0);

  const client = createTRPCClient<typeof router>({
    url: `http://localhost:${port}`,
    fetchOpts: {
      AbortController: AbortController as any,
      fetch: fetch as any,
    },
    getHeaders: opts?.getHeaders,
  });

  return {
    client,
    close: () => server.server.close(),
  };
}
