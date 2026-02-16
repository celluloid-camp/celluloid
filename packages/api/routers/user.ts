import {
  annotation,
  db,
  playlist,
  project,
  storage,
  user,
  userToProject,
} from "@celluloid/db";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray, lt, or, sql } from "drizzle-orm";
import { z } from "zod";
import { keys } from "../keys";
import { protectedProcedure, publicProcedure, router } from "../trpc";

const userColumnsSelect = {
  id: true,
  username: true,
  role: true,
  firstname: true,
  lastname: true,
  bio: true,
  avatarStorageId: true,
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

type ProjectEnrichment = {
  user: Record<string, unknown> | null;
  members: Array<{
    id: number;
    userId: string | null;
    projectId: string | null;
    user: Record<string, unknown> | null;
  }>;
  playlist: Record<string, unknown> | null;
  _count: { annotations: number; members: number };
};

export async function fetchProjectsEnrichment(
  projectIds: string[],
): Promise<Map<string, ProjectEnrichment>> {
  if (projectIds.length === 0) return new Map();
  const rows = await db.execute<{
    project_id: string;
    owner: Record<string, unknown> | null;
    members: unknown;
    playlist: Record<string, unknown> | null;
    annotation_count: number;
    member_count: number;
  }>(sql`
    SELECT
      p.id AS project_id,
      (SELECT row_to_json(u) FROM (SELECT id, username, role, firstname, lastname, bio, "avatarStorageId" FROM "User" u WHERE u.id = p."userId") u) AS owner,
      (SELECT coalesce(json_agg(m), '[]'::json) FROM (
        SELECT utp.id, utp."userId", utp."projectId",
          (SELECT row_to_json(u) FROM (SELECT id, username, role, firstname, lastname, bio, "avatarStorageId" FROM "User" u WHERE u.id = utp."userId") u) AS "user"
        FROM "UserToProject" utp WHERE utp."projectId" = p.id
      ) m) AS members,
      (SELECT row_to_json(pl) FROM "Playlist" pl WHERE pl.id = p."playlistId") AS playlist,
      (SELECT count(*)::int FROM "Annotation" a WHERE a."projectId" = p.id) AS annotation_count,
      (SELECT count(*)::int FROM "UserToProject" utp WHERE utp."projectId" = p.id) AS member_count
    FROM "Project" p
    WHERE p.id IN (${sql.join(
      projectIds.map((id) => sql`${id}`),
      sql`, `,
    )})
  `);
  const result = (
    rows as {
      rows: Array<{
        project_id: string;
        owner: Record<string, unknown> | null;
        members: unknown;
        playlist: Record<string, unknown> | null;
        annotation_count: number;
        member_count: number;
      }>;
    }
  ).rows;
  const map = new Map<string, ProjectEnrichment>();
  for (const r of result) {
    const members = Array.isArray(r.members)
      ? r.members
      : ((typeof r.members === "string"
          ? JSON.parse(r.members as string)
          : []) as ProjectEnrichment["members"]);
    map.set(r.project_id, {
      user: r.owner,
      members,
      playlist: r.playlist,
      _count: { annotations: r.annotation_count, members: r.member_count },
    });
  }
  return map;
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
      with: { storage: true },
    });
    return withAvatarUrl(record ?? null);
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
        columns: userColumnsSelect,
        with: { storage: true },
      });
      return withAvatarUrl(record ?? null);
    }),

  publicById: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      const record = await db.query.user.findFirst({
        where: eq(user.id, input.id),
        columns: userColumnsSelect,
        with: { storage: true },
      });
      return withAvatarUrl(record ?? null);
    }),

  projects: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = (input.limit ?? 50) + 1;
      const cursor = input.cursor;

      const memberProjectIds: string[] =
        ctx.user?.id != null
          ? (
              await db
                .select({ projectId: userToProject.projectId })
                .from(userToProject)
                .where(eq(userToProject.userId, ctx.user.id))
            )
              .map((r) => r.projectId)
              .filter((id): id is string => id != null)
          : [];

      let whereClause:
        | ReturnType<typeof eq>
        | ReturnType<typeof or>
        | undefined;
      if (ctx.user?.id == null) {
        whereClause = undefined;
      } else if (memberProjectIds.length > 0) {
        whereClause = or(
          eq(project.userId, ctx.user.id),
          inArray(project.id, memberProjectIds),
        );
      } else {
        whereClause = eq(project.userId, ctx.user.id);
      }

      if (whereClause === undefined) {
        return { items: [], nextCursor: undefined };
      }

      let cursorWhere = whereClause;
      if (cursor) {
        const [cursorRow] = await db
          .select({ publishedAt: project.publishedAt, id: project.id })
          .from(project)
          .where(eq(project.id, cursor))
          .limit(1);
        if (cursorRow) {
          cursorWhere = and(
            whereClause,
            or(
              lt(project.publishedAt, cursorRow.publishedAt),
              and(
                eq(project.publishedAt, cursorRow.publishedAt),
                lt(project.id, cursor),
              ),
            ),
          )!;
        }
      }

      const rows = await db
        .select()
        .from(project)
        .where(cursorWhere)
        .orderBy(desc(project.publishedAt))
        .limit(limit);

      const hasMore = rows.length === limit;
      const items = hasMore ? rows.slice(0, -1) : rows;
      const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

      if (items.length === 0) {
        return { items: [], nextCursor };
      }

      const enrichmentMap = await fetchProjectsEnrichment(
        items.map((p) => p.id),
      );
      const enriched = items.map((p) => {
        const e = enrichmentMap.get(p.id);
        return {
          ...p,
          user: e?.user ?? null,
          members: e?.members ?? [],
          playlist: e?.playlist ?? null,
          _count: e?._count ?? { annotations: 0, members: 0 },
        };
      });

      return {
        items: enriched.reverse(),
        nextCursor,
      };
    }),

  publicProjects: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        userId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const limit = (input.limit ?? 50) + 1;
      const cursor = input.cursor;

      const baseWhere = and(
        eq(project.userId, input.userId),
        eq(project.public, true),
      );

      let cursorWhere = baseWhere;
      if (cursor) {
        const [cursorRow] = await db
          .select({ publishedAt: project.publishedAt, id: project.id })
          .from(project)
          .where(eq(project.id, cursor))
          .limit(1);
        if (cursorRow) {
          cursorWhere = and(
            baseWhere,
            or(
              lt(project.publishedAt, cursorRow.publishedAt),
              and(
                eq(project.publishedAt, cursorRow.publishedAt),
                lt(project.id, cursor),
              ),
            ),
          )!;
        }
      }

      const rows = await db
        .select()
        .from(project)
        .where(cursorWhere)
        .orderBy(desc(project.publishedAt))
        .limit(limit);

      const hasMore = rows.length === limit;
      const items = hasMore ? rows.slice(0, -1) : rows;
      const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

      if (items.length === 0) {
        return { items: [], nextCursor };
      }

      const enrichmentMap = await fetchProjectsEnrichment(
        items.map((p) => p.id),
      );
      const enriched = items.map((p) => {
        const e = enrichmentMap.get(p.id);
        return {
          ...p,
          user: e?.user ?? null,
          members: e?.members ?? [],
          playlist: e?.playlist ?? null,
          _count: e?._count ?? { annotations: 0, members: 0 },
        };
      });

      return {
        items: enriched.reverse(),
        nextCursor,
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
          thumbnailUrl: project.thumbnailUrl,
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
          thumbnailURL: q.thumbnailUrl,
        })),
        _count: { projects: (projectsByPlaylist[i] ?? []).length },
      }));

      return {
        items: enriched,
        nextCursor,
      };
    }),
});
