import type { AppRouter } from "@celluloid/trpc";
import { createTRPCReact, TRPCClientError } from '@trpc/react-query';
import { inferRouterOutputs } from "@trpc/server";

export const trpc = createTRPCReact<AppRouter>();


/**
 async function main() {
  try {
    await trpc.post.byId.query('1');
  } catch (cause) {
    if (isTRPCClientError(cause)) {
      // `cause` is now typed as your router's `TRPCClientError`
      console.log('data', cause.data);
    } else {
      // [...]
    }
  }
}
 */
export function isTRPCClientError(
  cause: unknown,
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}


type RouterOutput = inferRouterOutputs<AppRouter>;

export type UserMe = RouterOutput['user']['me'];

export type ProjectById = RouterOutput['project']['byId'];

export type ProjectList = RouterOutput['project']['list'];
