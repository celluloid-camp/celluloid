import { db, playlist, project } from "@celluloid/db";
import { generateUniqueShareName } from "@celluloid/utils";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray, lt, or } from "drizzle-orm";
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
  extra: z.record(z.string(), z.unknown()),
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
      const limit = (input.limit ?? 50) + 1;
      const { cursor } = input;

      const whereUserId =
        input.authoredOnly && ctx.user
          ? eq(playlist.userId, ctx.user.id)
          : undefined;

      let cursorWhere = whereUserId;
      if (cursor && whereUserId) {
        const [cursorRow] = await db
          .select({ publishedAt: playlist.publishedAt, id: playlist.id })
          .from(playlist)
          .where(eq(playlist.id, cursor))
          .limit(1);
        if (cursorRow) {
          cursorWhere = and(
            whereUserId,
            or(
              lt(playlist.publishedAt, cursorRow.publishedAt),
              and(
                eq(playlist.publishedAt, cursorRow.publishedAt),
                lt(playlist.id, cursor),
              ),
            ),
          )!;
        }
      } else if (cursor) {
        const [cursorRow] = await db
          .select({ publishedAt: playlist.publishedAt, id: playlist.id })
          .from(playlist)
          .where(eq(playlist.id, cursor))
          .limit(1);
        if (cursorRow) {
          cursorWhere = or(
            lt(playlist.publishedAt, cursorRow.publishedAt),
            and(
              eq(playlist.publishedAt, cursorRow.publishedAt),
              lt(playlist.id, cursor),
            ),
          )!;
        }
      }

      const rows = cursorWhere
        ? await db
            .select()
            .from(playlist)
            .where(cursorWhere)
            .orderBy(desc(playlist.publishedAt))
            .limit(limit)
        : await db
            .select()
            .from(playlist)
            .orderBy(desc(playlist.publishedAt))
            .limit(limit);

      const hasMore = rows.length === limit;
      const items = hasMore ? rows.slice(0, -1) : rows;
      const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

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
      const [pl] = await db
        .select()
        .from(playlist)
        .where(eq(playlist.id, input.id))
        .limit(1);

      if (!pl) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No playlist with id '${input.id}'`,
        });
      }

      const projects = await db
        .select({
          id: project.id,
          title: project.title,
          thumbnailURL: project.thumbnailURL,
          description: project.description,
        })
        .from(project)
        .where(eq(project.playlistId, input.id))
        .orderBy(asc(project.publishedAt));

      return {
        ...pl,
        projects: projects.map((p) => ({
          ...p,
          thumbnailURL: p.thumbnailURL,
        })),
      };
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
      if (ctx.user.role !== "admin" && ctx.user.role !== "teacher") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to create a playlist",
        });
      }

      const [createdPlaylist] = await db
        .insert(playlist)
        .values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
        })
        .returning();

      if (!createdPlaylist) throw new Error("Failed to create playlist");

      if (input.projects.length > 0) {
        await db.insert(project).values(
          input.projects.map((p) => ({
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
            userId: ctx.user.id,
            shareCode: generateUniqueShareName(p.title),
            keywords: p.keywords,
            playlistId: createdPlaylist.id,
          })),
        );
      }

      const projects = await db
        .select()
        .from(project)
        .where(eq(project.playlistId, createdPlaylist.id))
        .orderBy(asc(project.publishedAt));

      return {
        ...createdPlaylist,
        projects: projects.map((p) => ({
          ...p,
          thumbnailURL: p.thumbnailURL,
        })),
      };
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
      const [pl] = await db
        .select({ userId: playlist.userId })
        .from(playlist)
        .where(eq(playlist.id, input.id))
        .limit(1);

      if (!pl) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No playlist with id '${input.id}'`,
        });
      }

      if (pl.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this playlist",
        });
      }

      if (input.projectIds !== undefined) {
        await db
          .update(project)
          .set({ playlistId: null })
          .where(eq(project.playlistId, input.id));

        if (input.projectIds.length > 0) {
          await db
            .update(project)
            .set({ playlistId: input.id })
            .where(
              and(
                inArray(project.id, input.projectIds),
                eq(project.userId, ctx.user.id),
              ),
            );
        }
      }

      const [updated] = await db
        .update(playlist)
        .set({
          title: input.title,
          description: input.description,
        })
        .where(eq(playlist.id, input.id))
        .returning();

      return updated!;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [pl] = await db
        .select({ userId: playlist.userId })
        .from(playlist)
        .where(eq(playlist.id, input.id))
        .limit(1);

      if (!pl) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No playlist with id '${input.id}'`,
        });
      }

      if (pl.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this playlist",
        });
      }

      await db.delete(playlist).where(eq(playlist.id, input.id));

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
      const [created] = await db
        .insert(playlist)
        .values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
        })
        .returning();

      if (!created) throw new Error("Failed to create playlist");

      if (input.projectIds && input.projectIds.length > 0) {
        await db
          .update(project)
          .set({ playlistId: created.id })
          .where(
            and(
              inArray(project.id, input.projectIds),
              eq(project.userId, ctx.user.id),
            ),
          );
      }

      const projects = await db
        .select({
          id: project.id,
          title: project.title,
          description: project.description,
          thumbnailURL: project.thumbnailURL,
        })
        .from(project)
        .where(eq(project.playlistId, created.id))
        .orderBy(asc(project.publishedAt));

      return {
        ...created,
        projects: projects.map((p) => ({
          ...p,
          thumbnailURL: p.thumbnailURL,
        })),
      };
    }),
});
