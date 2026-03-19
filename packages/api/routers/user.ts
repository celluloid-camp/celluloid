import {
  db,
  playlist,
  project,
  storage,
  user,
  userToProject,
} from "@celluloid/db";
import { withPagination } from "@celluloid/db/utils";
import { TRPCError } from "@trpc/server";
import { and, asc, count, desc, eq, inArray, lt, or } from "drizzle-orm";
import { z } from "zod";
import { keys } from "../keys";
import { protectedProcedure, publicProcedure, router } from "../trpc";

const userColumnsSelect = {
  id: true,
  username: true,
  role: true,
  color: true,
  initial: true,
  firstname: true,
  lastname: true,
  bio: true,
  image: true,
} as const;

function withAvatarUrl(
  u: {
    id: string;
    username: string;
    role: string | null;
    email?: string | null;
    firstname: string | null;
    lastname: string | null;
    bio: string | null;
    avatarStorageId: string | null;
    storage?: { id: string; path: string; bucket: string } | null;
  } | null,
) {
  if (!u) return null;
  const baseUrl = keys().STORAGE_URL?.replace(/\/$/, "") ?? "";
  const avatar =
    u.storage != null
      ? {
          id: u.storage.id,
          path: u.storage.path,
          publicUrl: `${baseUrl}/${u.storage.bucket}/${u.storage.path}`,
        }
      : null;
  const { storage: _s, ...rest } = u;
  return {
    ...rest,
    avatar,
    color: "#000000",
    initial: u.username
      .split(" ")
      .map((part) => part.substring(0, 1))
      .join(""),
  };
}

export const userRouter = router({
  joinProject: protectedProcedure
    .input(
      z.object({
        shareCode: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [record] = await db
        .select()
        .from(project)
        .where(eq(project.shareCode, input.shareCode))
        .limit(1);

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "CODE_NOT_FOUND",
        });
      }

      if (record.userId === ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "PROJECT_OWNER_CANNOT_JOIN",
        });
      }

      await db.insert(userToProject).values({
        userId: ctx.user.id,
        projectId: record.id,
      });
      return { projectId: record.id };
    }),

  me: publicProcedure.query(async (opts) => {
    const { ctx } = opts;
    if (!ctx.user) return null;
    const record = await db.query.user.findFirst({
      where: eq(user.id, ctx.user.id),
      columns: { ...userColumnsSelect, email: true, avatarStorageId: true },
      with: { storage: true },
    });
    return record;
  }),

  update: protectedProcedure
    .input(
      z.object({
        username: z.string(),
        firstname: z.string().nullish(),
        lastname: z.string().nullish(),
        bio: z.string().nullish(),
        avatarStorageId: z.string().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) return;

      const [record] = await db
        .select()
        .from(user)
        .where(eq(user.id, ctx.user.id))
        .limit(1);

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const avatarStorageId = input.avatarStorageId ?? undefined;

      if (record.avatarStorageId != null && avatarStorageId == null) {
        await db.delete(storage).where(eq(storage.id, record.avatarStorageId));
      }

      const [updated] = await db
        .update(user)
        .set({
          username: input.username || record.username,
          firstname: input.firstname ?? record.firstname,
          lastname: input.lastname ?? record.lastname,
          bio: input.bio ?? record.bio,
          avatarStorageId,
        })
        .where(eq(user.id, ctx.user.id))
        .returning();

      return updated!;
    }),

  byId: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      const record = await db.query.user.findFirst({
        where: eq(user.id, input.id),
      });
      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      return record;
    }),

  publicById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const record = await db.query.user.findFirst({
        where: eq(user.id, input.id),
        columns: userColumnsSelect,
      });
      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      return record;
    }),

  projects: protectedProcedure
    .input(
      z.object({
        pageSize: z.number().min(1).max(100).default(50),
        page: z.number().min(1).default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const whereClause = eq(project.userId, ctx.user.id);
      const [total] = await db
        .select({ count: count(project.id) })
        .from(project)
        .where(whereClause);

      const baseQuery = db
        .select({
          id: project.id,
          title: project.title,
          thumbnailURL: project.thumbnailURL,
          publishedAt: project.publishedAt,
          userId: project.userId,
          public: project.public,
          collaborative: project.collaborative,
          shared: project.shared,
          playlistId: project.playlistId,
          duration: project.duration,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            initial: user.initial,
            color: user.color,
            image: user.image,
          },
        })
        .from(project)
        .leftJoin(user, eq(project.userId, user.id))
        .where(whereClause)
        .$dynamic();

      const rows = await withPagination({
        query: baseQuery,
        orderBy: [desc(project.publishedAt)],
        pageSize: input.pageSize,
        page: input.page,
      });

      return {
        items: rows,
        total: total?.count ?? 0,
      };
    }),

  publicProjects: publicProcedure
    .input(
      z.object({
        pageSize: z.number().min(1).max(100).default(50),
        page: z.number().min(1).default(1),
        userId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const whereClause = and(
        eq(project.userId, input.userId),
        eq(project.public, true),
      );
      const [total] = await db
        .select({ count: count(project.id) })
        .from(project)
        .where(whereClause);

      const baseQuery = db
        .select({
          id: project.id,
          title: project.title,
          thumbnailURL: project.thumbnailURL,
          publishedAt: project.publishedAt,
          userId: project.userId,
          public: project.public,
          collaborative: project.collaborative,
          shared: project.shared,
          playlistId: project.playlistId,
          duration: project.duration,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            initial: user.initial,
            color: user.color,
            image: user.image,
          },
        })
        .from(project)
        .leftJoin(user, eq(project.userId, user.id))
        .where(whereClause)
        .$dynamic();

      const rows = await withPagination({
        query: baseQuery,
        orderBy: [desc(project.publishedAt)],
        pageSize: input.pageSize,
        page: input.page,
      });

      return {
        items: rows,
        total: total?.count ?? 0,
      };
    }),

  playlists: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = (input.limit ?? 50) + 1;
      const cursor = input.cursor;

      const baseWhere = eq(playlist.userId, ctx.user.id);
      let cursorWhere = baseWhere;

      if (cursor) {
        const [cursorRow] = await db
          .select({ publishedAt: playlist.publishedAt, id: playlist.id })
          .from(playlist)
          .where(eq(playlist.id, cursor))
          .limit(1);
        if (cursorRow) {
          cursorWhere = and(
            baseWhere,
            or(
              lt(playlist.publishedAt, cursorRow.publishedAt),
              and(
                eq(playlist.publishedAt, cursorRow.publishedAt),
                lt(playlist.id, cursor),
              ),
            ),
          )!;
        }
      }

      const rows = await db
        .select()
        .from(playlist)
        .where(cursorWhere)
        .orderBy(asc(playlist.publishedAt))
        .limit(limit);

      const hasMore = rows.length === limit;
      const items = hasMore ? rows.slice(0, -1) : rows;
      const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

      if (items.length === 0) {
        return { items: [], nextCursor };
      }

      const playlistIds = items.map((p) => p.id);
      const projects = await db
        .select({
          id: project.id,
          title: project.title,
          thumbnailURL: project.thumbnailURL,
          playlistId: project.playlistId,
        })
        .from(project)
        .where(inArray(project.playlistId, playlistIds));

      const projectsByPlaylist = playlistIds.map((id) =>
        projects.filter((p) => p.playlistId === id),
      );

      const enriched = items.map((p, i) => ({
        ...p,
        projects: (projectsByPlaylist[i] ?? []).map((q) => ({
          id: q.id,
          title: q.title,
          thumbnailURL: q.thumbnailURL,
        })),
        _count: { projects: (projectsByPlaylist[i] ?? []).length },
      }));

      return {
        items: enriched,
        nextCursor,
      };
    }),
});
