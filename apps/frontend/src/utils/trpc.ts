import type { AppRouter } from "@celluloid/trpc";
import { createTRPCReact, TRPCClientError } from '@trpc/react-query';
import type { inferRouterOutputs } from "@trpc/server";

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

type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;


type RouterOutput = inferRouterOutputs<AppRouter>;

export type UserMe = RouterOutput['user']['me'];

export type ProjectById = RouterOutput['project']['byId'];
export type ProjectMembers = ArrElement<ProjectById["members"]>;

export type ProjectList = RouterOutput['project']['list'];
export type ProjectListItem = ArrElement<RouterOutput['project']['list']>;

export type AnnotationsByProjectId = RouterOutput["annotation"]["byProjectId"]
export type AnnotationByProjectId = ArrElement<AnnotationsByProjectId>;
export type AnnotationCommentByProjectId = ArrElement<AnnotationByProjectId["comments"]>;


