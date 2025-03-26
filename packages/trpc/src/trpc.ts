import { initTRPC, TRPCError } from "@trpc/server";
import type { OpenApiMeta } from "trpc-to-openapi";
import type { Session } from "@celluloid/auth";
import superjson from "superjson";
import { ZodError } from "zod";
import { cache } from 'react';

export const createTRPCContext = cache((opts?: {
  session?: Session | null;
}) => {
  const session = opts?.session;

  const requireRoles = (roles: string[]) => {
    if (!session?.user?.role || !roles.includes(session?.user?.role)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `Missing permission: '${roles.join(",")}'.`,
      });
    }
    return true;
  };

  const user = session?.user;
  return {
    user,
    requireRoles,
  };
})

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    errorFormatter: ({ shape, error }) => ({
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }),
  });

const isAuthed = t.middleware((opts) => {
  const { ctx } = opts;
  if (!ctx.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
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

export const createCallerFactory = t.createCallerFactory;

