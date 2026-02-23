import { db, playlist, project, userToProject } from "@celluloid/db";
import { generateUniqueShareName } from "@celluloid/utils";
import { processScenesWorkflow } from "@celluloid/workflows/scenes-processing";
import { videoTranscriptWorkflow } from "@celluloid/workflows/transcript";
import { visionAnalysisWorkflow } from "@celluloid/workflows/vision";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, inArray, lt, or } from "drizzle-orm";
import { start } from "workflow/api";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { PlaylistSchema } from "./playlist";
import { fetchProjectsEnrichment } from "./user";

const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.string().nullable(),
  firstname: z.string().nullable(),
  lastname: z.string().nullable(),
  bio: z.string().nullable(),
  avatar: z
    .object({
      id: z.string(),
      path: z.string(),
      publicUrl: z.string(),
    })
    .nullable()
    .optional(),
});

const MemberSchema = z.object({
  id: z.number(),
  userId: z.string().nullable(),
  projectId: z.string().nullable(),
  user: UserSchema.nullable(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  videoId: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  host: z.string().nullable(),
  publishedAt: z.string(),
  public: z.boolean(),
  collaborative: z.boolean(),
  shared: z.boolean(),
  shareCode: z.string().nullable(),
  shareExpiresAt: z.string().nullable(),
  extra: z.record(z.string(), z.unknown()),
  playlistId: z.string().nullable(),
  duration: z.number(),
  thumbnailURL: z.string(),
  user: UserSchema.nullable(),
  playlist: PlaylistSchema.nullable(),
  members: z.array(MemberSchema),
  _count: z.object({
    annotations: z.number(),
    members: z.number(),
  }),
});

function toProjectResponse(p: {
  thumbnailUrl?: string | null;
  [k: string]: unknown;
}) {
  const { thumbnailUrl, ...rest } = p;
  return { ...rest, thumbnailURL: thumbnailUrl ?? "" };
}

export const projectRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        term: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = (input.limit ?? 50) + 1;
      const { cursor, term } = input;

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

      const termFilter = term ? ilike(project.title, `%${term}%`) : undefined;

      let baseWhere: ReturnType<typeof eq> | ReturnType<typeof or> | undefined;
      if (ctx.user?.id != null) {
        baseWhere =
          memberProjectIds.length > 0
            ? or(
                eq(project.public, true),
                eq(project.userId, ctx.user.id),
                inArray(project.id, memberProjectIds),
              )
            : or(eq(project.public, true), eq(project.userId, ctx.user.id));
      } else {
        baseWhere = eq(project.public, true);
      }

      const whereClause =
        termFilter != null ? and(baseWhere, termFilter) : baseWhere;

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
        const row = {
          ...p,
          user: e?.user ?? null,
          members: e?.members ?? [],
          playlist: e?.playlist ?? null,
          _count: e?._count ?? { annotations: 0, members: 0 },
        };
        return toProjectResponse(row);
      });

      return {
        items: enriched,
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
      const proj = await db.query.project.findFirst({
        where: eq(project.id, input.id),
        columns: {
          id: true,
          videoId: true,
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
          userId: true,
          playlistId: true,
          duration: true,
          thumbnailUrl: true,
          scenesProcessingRunId: true,
          scenesProcessingStatus: true,
          transcriptProcessingRunId: true,
          transcriptProcessingStatus: true,
          keywords: true,
        },
        with: {
          userToProjects: {
            columns: {
              userId: true,
            },
          },
          user: {
            columns: {
              id: true,
              username: true,
              role: true,
              initial: true,
              color: true,
              bio: true,
              image: true,
            },
          },
        },
      });

      if (!proj) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const result = {
        ...proj,
        editable:
          !!ctx.user &&
          (ctx.user.id === proj.userId || ctx.user.role === "admin"),
        deletable:
          !!ctx.user &&
          (ctx.user.id === proj.userId || ctx.user.role === "admin"),
        annotable:
          !!ctx.user &&
          (ctx.user.id === proj.userId ||
            ctx.user.role === "admin" ||
            (proj.userToProjects?.some(
              (m) => ctx.user && m.userId === ctx.user.id,
            ) &&
              proj.collaborative)),
        commentable:
          !!ctx.user &&
          (ctx.user.id === proj.userId ||
            ctx.user.role === "admin" ||
            (proj.userToProjects?.some(
              (m) => ctx.user && m.userId === ctx.user.id,
            ) &&
              proj.collaborative)),
      };

      return result;
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
        keywords: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "teacher") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to create a project",
        });
      }

      const [created] = await db
        .insert(project)
        .values({
          userId: ctx.user.id,
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
          thumbnailUrl: input.thumbnailURL,
          metadata: input.metadata,
          shareCode: input.shared ? generateUniqueShareName(input.title) : null,
          keywords: input.keywords,
        })
        .returning();

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create project",
        });
      }

      const scenesRun = await start(processScenesWorkflow, [created.id]);
      const transcriptRun = await start(videoTranscriptWorkflow, [created.id]);
      const visionRun = await start(visionAnalysisWorkflow, [created.id]);
      await db
        .update(project)
        .set({
          scenesProcessingRunId: scenesRun.runId,
          scenesProcessingStatus: "not_started",
          transcriptProcessingRunId: transcriptRun.runId,
          transcriptProcessingStatus: "not_started",
        })
        .where(eq(project.id, created.id));

      return { id: created.id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string().nullish(),
        description: z.string().nullish(),
        public: z.boolean().nullish(),
        collaborative: z.boolean().nullish(),
        shared: z.boolean().default(false),
        keywords: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "teacher") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to update a project",
        });
      }

      const [proj] = await db
        .select()
        .from(project)
        .where(
          and(eq(project.id, input.projectId), eq(project.userId, ctx.user.id)),
        )
        .limit(1);

      if (!proj) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      let shareCode = proj.shareCode;
      const newTitle =
        input.title !== undefined && input.title !== proj.title
          ? input.title
          : proj.title;

      if (proj.shared !== input.shared) {
        if (input.shared && newTitle) {
          shareCode = generateUniqueShareName(newTitle);
        } else {
          shareCode = null;
        }
      }

      const [updated] = await db
        .update(project)
        .set({
          title: input.title ?? proj.title,
          description: input.description ?? proj.description,
          public: input.public ?? proj.public,
          collaborative: input.collaborative ?? proj.collaborative,
          shared: input.shared ?? proj.shared,
          keywords: input.keywords?.length ? input.keywords : proj.keywords,
          shareCode,
        })
        .where(eq(project.id, input.projectId))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "teacher") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete a project",
        });
      }

      const [proj] = await db
        .select()
        .from(project)
        .where(
          and(eq(project.id, input.projectId), eq(project.userId, ctx.user.id)),
        )
        .limit(1);

      if (!proj) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      await db.delete(project).where(eq(project.id, input.projectId));

      return true;
    }),
  playlist: publicProcedure
    .input(
      z.object({
        playlistId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const pl = await db.query.playlist.findFirst({
        where: eq(playlist.id, input.playlistId),
        with: {
          projects: {
            columns: {
              id: true,
              title: true,
              description: true,
              thumbnailUrl: true,
            },
          },
        },
      });
      if (!pl) {
        return null;
      }

      return {
        ...pl,
        canEdit: ctx.user?.id === pl.userId || ctx.user?.role === "admin",
      };
    }),
  members: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await db.query.userToProject.findMany({
        where: eq(userToProject.projectId, input.projectId),
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              role: true,
              initial: true,
              color: true,
              image: true,
            },
          },
        },
      });
    }),
});
