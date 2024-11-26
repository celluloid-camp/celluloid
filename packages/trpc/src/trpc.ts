
import { type inferAsyncReturnType, initTRPC, TRPCError } from '@trpc/server';
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type {
  CreateWSSContextFnOptions,
} from '@trpc/server/adapters/ws';
import type { OpenApiMeta } from 'trpc-openapi';
import { auth } from "@celluloid/auth";
import { fromNodeHeaders } from "better-auth/node";


export async function createContext(opts: CreateExpressContextOptions | CreateWSSContextFnOptions) {

  const { req, res } = opts;

  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });


  const requireRoles = (roles: string[]) => {
    if (!session?.user?.role || !roles.includes(session?.user?.role)) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: `Missing permission: '${roles.join(",")}'.`
      })
    }

    return true;
  }

  const user = session?.user;
  return {
    user, requireRoles,
    req,
    res,
  };
};


export type Context = inferAsyncReturnType<typeof createContext>;


const t = initTRPC.context<Context>().meta<OpenApiMeta>().create({
  // transformer: SuperJSON
});


const isAuthed = t.middleware((opts) => {
  const { ctx } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return opts.next({ ctx });
});


/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
