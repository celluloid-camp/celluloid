import { Prisma, prisma, UserRole } from '@celluloid/prisma';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { protectedProcedure, publicProcedure, router } from '../trpc';

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
        term: z.string().nullish()
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor, term } = input;

      const withterm: Prisma.ProjectWhereInput = term ? {
        title: {
          search: `%${term}%`,
        },
      } : {};

      const items = await prisma.project.findMany({
        // select: defaultPostSelect,
        // get an extra item at the end which we'll use as next cursor
        distinct: ["playlistId"],
        take: limit + 1,
        where: {
          ...withterm,
          OR: [
            {
              public: true,
            },
            { userId: ctx.user ? ctx.user.id : undefined },
          ]
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
          user: {
            select: {
              id: true,
              username: true,
              role: true,
              initial: true,
              color: true
            }
          },
          playlist: {
            include: {
              projects: true,
            }
          },
          _count: {
            select: {
              annotations: true,
              members: true
            }
          },
          members: {
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
  add: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string(),
        objective: z.string(),
        levelStart: z.number(),
        levelEnd: z.number(),
        public: z.boolean(),
        collaborative: z.boolean(),
        shared: z.boolean(),
        userId: z.string(),
        videoId: z.string(),
        duration: z.number(),
        thumbnailURL: z.string().url(),
        metadata: z.any(),
        host: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user && ctx.user.id && ctx.requirePermissions([UserRole.Teacher, UserRole.Admin])) {
        const project = await prisma.project.create({
          data: {
            userId: ctx.user?.id,
            title: input.title,
            description: input.description,
            videoId: input.videoId,
            host: input.host,
            objective: input.objective,
            levelStart: input.levelStart,
            levelEnd: input.levelEnd,
            public: input.public,
            collaborative: input.collaborative,
            shared: input.shared,
            duration: input.duration,
            thumbnailURL: input.thumbnailURL,
            metadata: input.metadata,
          }
          // select: defaultPostSelect,
        });
        return project;
      }
    }),
});
