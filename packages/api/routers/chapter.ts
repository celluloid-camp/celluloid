import { EventEmitter } from "node:events";
import {
  chapter,
  db,
  project,
  videoAnalysis,
  videoScenes,
} from "@celluloid/db";
import { sceneDetectWorkflow } from "@celluloid/workflows/scene_detect";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, sql } from "drizzle-orm";
import { start } from "workflow/api";
import { z } from "zod";
import { keys } from "../keys";
import { protectedProcedure, publicProcedure, router } from "../trpc";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();

function getThumbnailUrl(
  storage: { bucket: string; path: string } | null,
): string | null {
  if (!storage) return null;
  const baseUrl = keys().STORAGE_URL.replace(/\/$/, "");
  return `${baseUrl}/${storage.bucket}/${storage.path}`;
}

export const chapterRouter = router({
  byProjectId: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { projectId } = input;
      const chapters = await db.query.chapter.findMany({
        where: eq(chapter.projectId, projectId),
        with: {
          storage: {
            columns: {
              bucket: true,
              path: true,
            },
          },
          user: {
            columns: {
              username: true,
            },
          },
        },
        orderBy: asc(chapter.startTime),
      });
      return chapters.map((c) => ({
        ...c,
        thumbnailURL: getThumbnailUrl(c.storage),
        lastEditedBy: c.user?.username ?? null,
      }));
    }),
  generate: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "teacher") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to generate chapters",
        });
      }
      const record = await db.query.project.findFirst({
        where:
          ctx.user.role === "admin"
            ? eq(project.id, input.projectId)
            : and(
                eq(project.id, input.projectId),
                eq(project.userId, ctx.user.id),
              ),
        with: {
          videoScenes: {
            columns: {
              id: true,
              status: true,
            },
          },
        },
      });

      if (!record) {
        throw new Error("Project not found");
      }

      if (
        record.videoScenes &&
        ["pending", "processing"].includes(record.videoScenes.status)
      ) {
        throw new Error("Scenes processing is already in progress");
      }

      const run = await start(sceneDetectWorkflow, [record.id]);

      // delete existing chapters
      await db.delete(chapter).where(eq(chapter.projectId, record.id));

      await db
        .insert(videoScenes)
        .values({
          projectId: record.id,
          status: "pending",
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .onConflictDoUpdate({
          target: videoScenes.id,
          set: {
            status: "pending",
            updatedAt: sql`CURRENT_TIMESTAMP`,
          },
        });

      return record;
    }),
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        startTime: z.number(),
        endTime: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const record = await db.query.project.findFirst({
        where: and(
          eq(project.id, input.projectId),
          eq(project.userId, ctx.user.id),
        ),
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (ctx.user.role === "admin" || record.userId === ctx.user.id) {
        const newChapter = await db
          .insert(chapter)
          .values({
            projectId: input.projectId,
            startTime: input.startTime,
            endTime: input.endTime,
            title: input.title,
            description: input.description,
            updatedAt: sql`CURRENT_TIMESTAMP`,
            lastEditedById: ctx.user.id,
          })
          .returning();

        if (!newChapter) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to create chapter",
          });
        }
        return newChapter;
      }

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Can't edit this annotation",
      });
    }),
  edit: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        chapterId: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        startTime: z.number().optional(),
        endTime: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const record = await db.query.chapter.findFirst({
        where: and(
          eq(chapter.id, input.chapterId),
          eq(chapter.projectId, input.projectId),
        ),
        with: {
          project: {
            columns: {
              userId: true,
            },
          },
        },
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
        });
      }

      if (ctx.user?.role === "admin" || record.project.userId === ctx.user.id) {
        // Perform the update
        const updatedChapter = await db
          .update(chapter)
          .set({
            title: input.title ?? record.title,
            description: input.description ?? record.description,
            startTime: input.startTime ?? record.startTime,
            endTime: input.endTime ?? record.endTime,
            updatedAt: sql`CURRENT_TIMESTAMP`,
            lastEditedById: ctx.user.id,
          })
          .where(eq(chapter.id, input.chapterId))
          .returning();

        // ee.emit('change', updatedChapter);
        return updatedChapter;
      }

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Can't edit this annotation",
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        chapterId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Check if the annotation with the given ID exists
      const record = await db.query.chapter.findFirst({
        where: and(eq(chapter.id, input.chapterId)),
        with: {
          project: {
            columns: {
              userId: true,
            },
          },
        },
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
        });
      }

      if (
        ctx.user?.role === "admin" ||
        record.project.userId === ctx.user?.id
      ) {
        const deletedChapter = await db
          .delete(chapter)
          .where(eq(chapter.id, input.chapterId))
          .returning();
        if (!deletedChapter) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to delete chapter",
          });
        }
        return deletedChapter;
      }
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Can't edit this chapter",
      });
    }),
  reset: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const record = await db.query.project.findFirst({
        where: and(eq(project.id, input.projectId)),
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (ctx.user.role === "admin" || record.userId === ctx.user.id) {
        // Check if the annotation with the given ID exists
        await db.delete(chapter).where(eq(chapter.projectId, input.projectId));
        return;
      }
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Can't reset this chapter",
      });
    }),
});
