import { prisma } from "@celluloid/prisma"
import { z } from 'zod';

import { protectedProcedure, router } from '../trpc';


export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.string(),
  initial: z.string(),
  color: z.string(),
});


export const userRouter = router({
  list: protectedProcedure.query(async () => {
    // Retrieve users from a datasource, this is an imaginary database
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['Student', 'Teacher'] }
      },
    });
    return users;
  }),
  me: protectedProcedure.query(async (opts) => {
    const { ctx } = opts;
    if (ctx.user) {
      // Retrieve the user with the given ID
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id }
      });
      return user;
    }
    return null;
  }),
  byId: protectedProcedure.input(
    z.object({
      id: z.string().uuid(),
    }),
  ).query(async (opts) => {
    const { input } = opts;
    // Retrieve the user with the given ID
    const user = await prisma.user.findUnique({ where: { id: input.id } });
    return user;
  }),
  projects: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish()
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor, } = input;

      const items = await prisma.project.findMany({
        // select: defaultPostSelect,
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        where: {
          userId: ctx.user.id
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true,
              initial: true,
              color: true
            }
          },
          members: true,
          playlist: {
            include: {
              _count: true
            }
          },
          _count: true
        },
        cursor: cursor
          ? {
            id: cursor,
          }
          : undefined,
        orderBy: {
          publishedAt: 'desc',
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        // Remove the last item and use it as next cursor

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nextItem = items.pop()!;
        nextCursor = nextItem.id;
      }

      return {
        items: items.reverse(),
        nextCursor,
      };
    }),
  logout: protectedProcedure
    .mutation(async (opts) => {
      const { ctx } = opts;
      return ctx.logout();
    }),
});

