import { prisma } from "@celluloid/database"
import { z } from 'zod';

import { protectedProcedure, router } from '../trpc';



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
  logout: protectedProcedure
    .mutation(async (opts) => {
      const { ctx } = opts;
      return ctx.logout();
    }),
});

