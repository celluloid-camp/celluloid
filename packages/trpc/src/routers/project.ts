import { Prisma, prisma, UserRole } from '@celluloid/prisma';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { protectedProcedure, publicProcedure, router } from '../trpc';
import { PlaylistSchema } from './playlist';
import { UserSchema } from './user';

export const defaultProjectSelect = Prisma.validator<Prisma.ProjectSelect>()({
  id: true,
  videoId: true,
  userId: true,
  title: true,
  description: true,
  host: true,
  publishedAt: true,
  public: true,
  collaborative: true,
  shared: true,
  shareName: true,
  shareExpiresAt: true,
  extra: true,
  playlistId: true,
  duration: true,
  thumbnailURL: true,
});

const MemberSchema = z.object({
  id: z.number(),
  userId: z.string(),
  projectId: z.string(),
  user: UserSchema,
});


export const ProjectSchema = z.object({
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
  shareName: z.string().nullable(),
  shareExpiresAt: z.null().nullable(),
  extra: z.record(z.unknown()),
  playlistId: z.string(),
  duration: z.number(),
  thumbnailURL: z.string(),
  user: UserSchema,
  playlist: PlaylistSchema,
  members: z.array(MemberSchema),
  _count: z.object({
    annotations: z.number(),
    members: z.number(),
  }),
});



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
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const project = await prisma.project.findUnique({
        where: { id },
        select: {
          ...defaultProjectSelect,
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
              projects: {
                select: defaultProjectSelect
              },
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
        },
        // select: defaultPostSelect,
      });
      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No project with id '${id}'`,
        });
      }

      return {
        ...project,
        editable: ctx.user && ctx.user?.id == project.userId || ctx.user?.role == UserRole.Admin,
        deletable: ctx.user && ctx.user?.id == project.userId || ctx.user?.role == UserRole.Admin,
        annotable: ctx.user && ctx.user?.id == project.userId || ctx.user?.role == UserRole.Admin || project.members.some(m => m.id == ctx.user?.id),
        commentable: ctx.user && ctx.user?.id == project.userId || ctx.user?.role == UserRole.Admin || project.members.some(m => m.id == ctx.user?.id)
      };
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
  update: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string().nullish(),
        description: z.string().nullish(),
        public: z.boolean().nullish(),
        collaborative: z.boolean().nullish(),
        shared: z.boolean().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user && ctx.user.id && ctx.requirePermissions([UserRole.Teacher, UserRole.Admin])) {

        // Find the project by its ID (you need to replace 'projectId' with the actual ID)
        const project = await prisma.project.findUnique({
          where: {
            id: input.projectId,
            userId: ctx.user.id
          }
        });

        if (!project) {
          throw new Error('Project not found');
        }

        const updatedProject = await prisma.project.update({
          where: {
            id: project.id
          },
          data: {
            title: input.title || project.title,
            description: input.description || project.description,
            public: input.public !== null ? input.public : false,
            collaborative: input.collaborative !== null ? input.collaborative : false,
            shared: input.shared !== null ? input.shared : false
          }
        });

        return updatedProject;
      }
    }),
  delete: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user && ctx.user.id && ctx.requirePermissions([UserRole.Teacher, UserRole.Admin])) {

        // Find the project by its ID (you need to replace 'projectId' with the actual ID)
        const project = await prisma.project.findUnique({
          where: {
            id: input.projectId,
            userId: ctx.user.id
          }
        });

        if (!project) {
          throw new Error('Project not found');
        }

        const deletedProject = await prisma.project.delete({
          where: {
            id: input.projectId // Replace projectId with the actual ID of the project you want to delete
          }
        });

        return deletedProject;
      }
    }),
});
