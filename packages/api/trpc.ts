import { auth, type Session } from "@celluloid/auth";
import { db } from "@celluloid/db";
import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { ZodError } from "zod";
import { keys } from "./keys";

export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const { req } = opts;

  // Get session from Better Auth

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  // const requireRoles = (roles: string[]) => {
  //   if (!session?.user?.role || !roles.includes(session?.user?.role)) {
  //     throw new TRPCError({
  //       code: "UNAUTHORIZED",
  //       message: `Missing permission: '${roles.join(",")}'.`,
  //     });
  //   }
  //   return true;
  // };

  const user = session?.user;
  return {
    user,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

const isAuthed = t.middleware(({ ctx, next }) => {
  if (ctx.user === undefined || ctx.user.id === undefined) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const isAdmin = t.middleware((opts) => {
  const { ctx } = opts;
  if (!ctx.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return opts.next({ ctx: { ...ctx, user: ctx.user } });
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
export const createCallerFactory = t.createCallerFactory;
