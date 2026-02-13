import { db } from "@celluloid/db";
import { generateUniqueShareName } from "@celluloid/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../trpc";

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

      const items = await db.playlist.findMany({
        // select: defaultPostSelect,
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        where: {
          userId: input.authoredOnly && ctx.user ? ctx.user.id : undefined,
        },
        include: {},
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        orderBy: {
          publishedAt: "desc",
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
      const playlist = await db.playlist.findUnique({
        where: { id },
        include: {
          projects: {
            select: {
              id: true,
              title: true,
              thumbnailURL: true,
              description: true,
            },
            orderBy: {
              publishedAt: "asc",
            },
          },
        },
      });
      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No playlist with id '${id}'`,
        });
      }
      return playlist;
    }),
  add: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string(),
        projects: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            videoId: z.string(),
            host: z.string(),
            duration: z.number(),
            thumbnailURL: z.string().url(),
            metadata: z.any(),
            keywords: z.array(z.string()),
          }),
        ),
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
      if (ctx.user && ctx.requireRoles(["teacher", "admin"])) {
        const userId = ctx.user.id;

        const project = await db.playlist.create({
          select: {
            projects: true,
          },
          data: {
            userId: ctx.user?.id,
            title: input.title,
            description: input.description,
            projects: {
              createMany: {
                data: input.projects.map((p) => ({
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
                  shareCode: generateUniqueShareName(p.title),
                  keywords: p.keywords,
                })),
              },
            },
          },
          // select: defaultPostSelect,
        });
        return project;
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        description: z.string(),
        projectIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const playlist = await db.playlist.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No playlist with id '${input.id}'`,
        });
      }

      if (playlist.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this playlist",
        });
      }

      // If projectIds is provided, update the projects in the playlist
      if (input.projectIds !== undefined) {
        // First, remove all projects from this playlist
        await db.project.updateMany({
          where: { playlistId: input.id },
          data: { playlistId: null },
        });

        // Then, add the new projects to the playlist
        if (input.projectIds.length > 0) {
          await db.project.updateMany({
            where: {
              id: { in: input.projectIds },
              userId: ctx.user.id, // Only allow updating own projects
            },
            data: { playlistId: input.id },
          });
        }
      }

      const updatedPlaylist = await db.playlist.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
        },
      });

      return updatedPlaylist;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const playlist = await db.playlist.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No playlist with id '${input.id}'`,
        });
      }

      if (playlist.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this playlist",
        });
      }

      await db.playlist.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string(),
        projectIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const playlist = await db.playlist.create({
        data: {
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          projects: input.projectIds
            ? {
                connect: input.projectIds.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          projects: {
            select: {
              id: true,
              title: true,
              description: true,
              thumbnailURL: true,
            },
          },
        },
      });

      return playlist;
    }),
});
