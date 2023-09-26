import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { prisma } from '../prisma';
import { publicProcedure, router } from '../trpc';

// const defaultPostSelect = Prisma.validator<Prisma.ProjectSelect>()({
//   id: true,
//   title: true,
//   text: true,
//   createdAt: true,
//   updatedAt: true,
// });


export const projectRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        authoredOnly: z.boolean().nullish().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      /**
       * For pagination docs you can have a look here
       * @see https://trpc.io/docs/useInfiniteQuery
       * @see https://www.prisma.io/docs/concepts/components/prisma-client/pagination
       */

      const limit = input.limit ?? 50;
      const { cursor } = input;

      const items = await prisma.project.findMany({
        // select: defaultPostSelect,
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        where: {
          public: input.authoredOnly ? undefined : true,
          userId: input.authoredOnly && ctx.user ? ctx.user.id : undefined,
        },
        include: {

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
  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          playlist: {
            include: {
              projects: true,
            }
          }
        }
        // select: defaultPostSelect,
      });
      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No project with id '${id}'`,
        });
      }
      return project;
    }),
  add: publicProcedure
    .input(
      z.object({
        videoId: z.string(),
        title: z.string().min(1),
        description: z.string(),
        objective: z.string(),
        levelStart: z.number(),
        levelEnd: z.number(),
        public: z.boolean(),
        collaborative: z.boolean(),
        shared: z.boolean(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const project = await prisma.project.create({
        data: input,
        // select: defaultPostSelect,
      });
      return project;
    }),
});
