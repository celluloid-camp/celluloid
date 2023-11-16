import "express-session"

import { User, UserRole } from '@celluloid/prisma';
import { inferAsyncReturnType, initTRPC, TRPCError } from '@trpc/server';
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import {
  CreateWSSContextFnOptions,
} from '@trpc/server/adapters/ws';
import { type Request, type Response } from 'express';
import { Session } from "express-session";
import { OpenApiMeta } from 'trpc-openapi';

// export type Context = {
//   user: User | null;

//   requirePermissions: (roles: UserRole[]) => boolean;
//   logout: () => Promise<boolean>;
//   req: Request;
//   res: Response;
// };

declare module 'http' {
  interface IncomingMessage {
    session: Session & {
      userId?: string
    }
  }
}


export async function createContext(opts: CreateExpressContextOptions | CreateWSSContextFnOptions) {

  const { req, res } = opts;

  const user: User | null = (req as Request).user as User;
  const requirePermissions = (roles: UserRole[]) => {
    if (!user?.role || !roles.includes(user?.role)) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: `Missing permission: '${roles.join(",")}'.`
      })
    }

    return true;
  }

  const logout = (): Promise<boolean> => {
    return new Promise((resolve) => {
      req.session?.destroy((err: Error | null) => {
        if (err) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Enable to log out`
          })
        } else {
          resolve(true)
        }
      });
    })
  }
  return {
    user, requirePermissions, logout, req,
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
