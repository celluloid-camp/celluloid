import { UserRole } from '@celluloid/prisma';
import { prisma } from "@celluloid/prisma"
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { protectedProcedure, publicProcedure, router } from '../trpc';
import { generateUniqueShareName } from '../utils/share';

// const defaultPostSelect = Prisma.validator<Prisma.ProjectSelect>()({
//   id: true,
//   title: true,
//   text: true,
//   createdAt: true,
//   updatedAt: true,
// });


export const PlaylistProjectSchema = z.object({
  id: z.string(),
  videoId: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  host: z.string(),
  publishedAt: z.string(),
  public: z.boolean(),
  collaborative: z.boolean(),
  shared: z.boolean(),
  shareCode: z.string().nullable(),
  shareExpiresAt: z.null().nullable(),
  extra: z.record(z.unknown()),
  playlistId: z.string(),
  duration: z.number(),
  thumbnailURL: z.string(),
});

export const PlaylistSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  userId: z.string(),
  publishedAt: z.string(),
  projects: z.array(PlaylistProjectSchema),
});



export const playlistRouter = router({
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

      const items = await prisma.playlist.findMany({
        // select: defaultPostSelect,
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        where: {
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
      const project = await prisma.playlist.findUnique({
        where: { id },
        // select: defaultPostSelect,
      });
      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No playlist with id '${id}'`,
        });
      }
      return project;
    }),
  add: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string(),
        projects: z.array(z.object({
          title: z.string(),
          description: z.string(),
          videoId: z.string(),
          host: z.string(),
          duration: z.number(),
          thumbnailURL: z.string().url(),
          metadata: z.any(),
        })),
        objective: z.string(),
        levelStart: z.number(),
        levelEnd: z.number(),
        public: z.boolean(),
        collaborative: z.boolean(),
        shared: z.boolean(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user && ctx.requirePermissions([UserRole.Teacher, UserRole.Admin])) {
        const userId = ctx.user.id;

        const project = await prisma.playlist.create({
          select: {
            projects: true,
          },
          data: {
            userId: ctx.user?.id,
            title: input.title,
            description: input.description,
            projects: {
              createMany: {
                data: input.projects.map(p => ({
                  videoId: p.videoId,
                  host: p.host,
                  title: p.title,
                  description: p.description,
                  objective: input.objective,
                  levelStart: input.levelStart,
                  levelEnd: input.levelEnd,
                  public: input.public,
                  collaborative: input.collaborative,
                  shared: input.shared,
                  duration: p.duration,
                  thumbnailURL: p.thumbnailURL,
                  metadata: p.metadata,
                  userId: userId,
                  shareCode: generateUniqueShareName(p.title)
                }))
              }
            }

          },
          // select: defaultPostSelect,
        });
        return project;
      }
    }),
});
