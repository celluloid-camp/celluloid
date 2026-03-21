import {
  db,
  ProjectSelect,
  playlist,
  project,
  user,
  userToProject,
  videoAnalysis,
  videoScenes,
} from "@celluloid/db";
import { getDbErrorMessage, withPagination } from "@celluloid/db/utils";
import { generateUniqueShareName } from "@celluloid/utils";
import { sceneDetectWorkflow } from "@celluloid/workflows/scene_detect";
import { videoTranscriptWorkflow } from "@celluloid/workflows/transcript";
import { visionAnalysisWorkflow } from "@celluloid/workflows/vision";
import { TRPCError } from "@trpc/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  ne,
  sql,
} from "drizzle-orm";
import { getRun, start } from "workflow/api";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const projectRouter = router({
  list: publicProcedure
    .input(
      z.object({
        pageSize: z.number().min(1).max(100).default(50),
        page: z.number().min(1).default(1),
        term: z.string().nullish(),
        scope: z.enum(["explorer", "my", "collaboration"]).default("explorer"),
        sortBy: z
          .enum(["recent_added", "publication_date", "name"])
          .default("recent_added"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, term, scope, sortBy } = input;

      let scopeWhere:
        | ReturnType<typeof eq>
        | ReturnType<typeof and>
        | ReturnType<typeof inArray>
        | undefined;

      if (scope === "my") {
        if (!ctx.user?.id) {
          return { items: [], total: 0 };
        }
        scopeWhere = eq(project.userId, ctx.user.id);
      } else if (scope === "collaboration") {
        if (!ctx.user?.id) {
          return { items: [], total: 0 };
        }
        const memberProjectIds = (
          await db
            .select({ projectId: userToProject.projectId })
            .from(userToProject)
            .where(eq(userToProject.userId, ctx.user.id))
        )
          .map((r) => r.projectId)
          .filter((id): id is string => id != null);

        if (memberProjectIds.length === 0) {
          return { items: [], total: 0 };
        }
        scopeWhere = and(
          inArray(project.id, memberProjectIds),
          ne(project.userId, ctx.user.id),
        )!;
      }

      const termWhere = term ? ilike(project.title, `%${term}%`) : undefined;
      const whereClause = scopeWhere
        ? termWhere
          ? and(scopeWhere, termWhere)
          : scopeWhere
        : termWhere;
      const orderBy =
        sortBy === "name"
          ? [asc(project.title)]
          : sortBy === "publication_date"
            ? [asc(project.publishedAt)]
            : [desc(project.publishedAt)];

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

      const paginatedQuery = withPagination({
        query: baseQuery,
        orderBy,
        pageSize,
        page,
      });

      const rows = await paginatedQuery;

      return {
        items: rows,
        total: total?.count ?? 0,
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
          thumbnailURL: true,
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
          playlist: {
            columns: {
              id: true,
              title: true,
              description: true,
            },
          },
          videoScenes: {
            columns: {
              status: true,
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

      // if (
      //   result.transcriptProcessingStatus === "in_progress" &&
      //   result.transcriptProcessingRunId === null
      // ) {
      //   const [updated] = await db
      //     .update(project)
      //     .set({
      //       transcriptProcessingStatus: "failed",
      //       transcriptProcessingRunId: null,
      //     })
      //     .where(eq(project.id, result.id))
      //     .returning();
      //   return {
      //     ...result,
      //     transcriptProcessingStatus: updated?.transcriptProcessingStatus,
      //   };
      // }

      // if (
      //   result.transcriptProcessingRunId &&
      //   result.transcriptProcessingStatus === "in_progress"
      // ) {
      //   const run = getRun(result.transcriptProcessingRunId);
      //   const exists = await run.exists;
      //   const status = await run.status;
      //   if (!exists || status === "failed") {
      //     const [updated] = await db
      //       .update(project)
      //       .set({
      //         transcriptProcessingStatus: "failed",
      //         transcriptProcessingRunId: null,
      //       })
      //       .where(eq(project.id, result.id))
      //       .returning();
      //     return {
      //       ...result,
      //       transcriptProcessingRunId: null,
      //       transcriptProcessingStatus: updated?.transcriptProcessingStatus,
      //     };
      //   }
      //   if (status === "completed") {
      //     const [updated] = await db
      //       .update(project)
      //       .set({
      //         transcriptProcessingStatus: "completed",
      //         transcriptProcessingRunId: null,
      //       })
      //       .where(eq(project.id, result.id))
      //       .returning();
      //     return {
      //       ...result,
      //       transcriptProcessingRunId: null,
      //       transcriptProcessingStatus: updated?.transcriptProcessingStatus,
      //     };
      //   }
      // }

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

      let created: ProjectSelect | undefined;
      try {
        [created] = await db
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
            thumbnailURL: input.thumbnailURL,
            metadata: input.metadata,
            shareCode: input.shared
              ? generateUniqueShareName(input.title)
              : null,
            keywords: input.keywords,
          })
          .returning();
      } catch (error) {
        const { message, constraint } = getDbErrorMessage(error);
        console.error("Database operation failed:", {
          message,
          constraint,
          originalError: error,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create project",
        });
      }

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create project",
        });
      }

      const scenesRun = await start(sceneDetectWorkflow, [created.id]);
      const transcriptRun = await start(videoTranscriptWorkflow, [created.id]);
      const visionRun = await start(visionAnalysisWorkflow, [created.id]);
      await db
        .update(project)
        .set({
          transcriptProcessingRunId: transcriptRun.runId,
          transcriptProcessingStatus: "not_started",
        })
        .where(eq(project.id, created.id));

      await db.insert(videoScenes).values({
        projectId: created.id,
        runId: scenesRun.runId,
        status: "pending",
        updatedAt: sql`CURRENT_TIMESTAMP`,
      });

      await db.insert(videoAnalysis).values({
        projectId: created.id,
        status: "pending",
        runId: visionRun.runId,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      });

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
              thumbnailURL: true,
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
      const results = await db.query.userToProject.findMany({
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
      return results;
    }),
});
