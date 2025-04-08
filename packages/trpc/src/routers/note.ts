import { Prisma, prisma } from '@celluloid/prisma';
import { generateUniqueShareName } from '@celluloid/utils';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { protectedProcedure, publicProcedure, router } from '../trpc';
import { PlaylistSchema } from './playlist';
import { UserSchema } from './user';
import { chaptersQueue } from '@celluloid/queue';

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
  shareCode: true,
  shareExpiresAt: true,
  extra: true,
  playlistId: true,
  duration: true,
  thumbnailURL: true,
  metadata: false,
  keywords: true
});

export const defaultUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  username: true,
  role: true,
  initial: true,
  color: true,
  avatar: {
    select: {
      id: true,
      //@ts-expect-error dynamic
      publicUrl: true,
      path: true
    }
  }
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
  shareCode: z.string().nullable(),
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



export const noteRouter = router({
  list: protectedProcedure
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

      if (!ctx.user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view this note',
        });
      }

      const items = await prisma.projectNote.findMany({
        // select: defaultPostSelect,
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        where: {
          userId: ctx.user.id
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          project: {
            select: {
              id: true,
              title: true,
            }
          }
        },
        cursor: cursor
          ? {
            id: cursor,
          }
          : undefined,
        orderBy: {
          createdAt: 'desc',
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        // Remove the last item and use it as next cursor
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const nextItem = items.pop()!;
        nextCursor = nextItem.id;
      }

      return {
        items: items.reverse(),
        nextCursor,
      };
    }),
  byProjectId: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { projectId } = input;

      if (!ctx.user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view this note',
        });
      }

      const note = await prisma.projectNote.findUnique({
        where: { projectId_userId: { projectId: projectId, userId: ctx.user.id } },
        select: {
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log("note", note, ctx.user, projectId)
      if (!note) {
        return null;
      }



      return note;
    }),

  update: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        content: z.any()
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.id) {

        // Find the project by its ID (you need to replace 'projectId' with the actual ID)
        const project = await prisma.project.findUnique({
          where: {
            id: input.projectId,
          }
        });

        if (!project) {
          throw new Error('Project not found');
        }


        const result = await prisma.projectNote.upsert({
          where: {
            projectId_userId: {
              projectId: project.id,
              userId: ctx.user.id
            }
          },
          update: {
            content: input.content
          },
          create: {
            projectId: project.id,
            userId: ctx.user.id,
            content: input.content
          }
        });

        return result;
      }
    }),

});
