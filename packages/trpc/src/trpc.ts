import "express-session"

import { User, UserRole } from '@celluloid/prisma';
import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Request } from "express";
import { Session } from "express-session";
import { OpenApiMeta } from 'trpc-openapi';
import { v4 as uuid } from 'uuid';

export type Context = {
  user: User | null;
  requestId: string;
  requirePermissions: (roles: UserRole[]) => boolean;
  logout: () => Promise<boolean>;
};

export const createRPCContext = async ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions): Promise<Context> => {
  const requestId = uuid();
  res.setHeader('x-request-id', requestId);
  const user: User | null = req.user as User;
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
  return { user, requirePermissions, logout, requestId };
};

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
