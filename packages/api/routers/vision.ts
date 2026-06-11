import { db, project, videoAnalysis } from "@celluloid/db";
import {
  checkObjectDetectJobStatus,
  visionAnalysisWorkflow,
} from "@celluloid/workflows/vision";
import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { resumeHook, start } from "workflow/api";
import { z } from "zod";
import { keys } from "../keys";
import { protectedProcedure, publicProcedure, router } from "../trpc";

function getSpritePublicUrl(
  storage: { id: string; path: string; bucket: string } | null,
) {
  if (!storage) return null;
  const baseUrl = keys().STORAGE_URL?.replace(/\/$/, "") ?? "";
  return `${baseUrl}/${storage.bucket}/${storage.path}`;
}

export const visionRouter = router({
  byProjectId: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const analysis = await db.query.videoAnalysis.findFirst({
        where: eq(videoAnalysis.projectId, input.projectId),
        columns: {
          status: true,
          visionJobId: true,
          data: true,
          spriteURL: true,
        },
        with: {
          storage: {
            columns: {
              id: true,
              path: true,
              bucket: true,
            },
          },
        },
      });

      if (!analysis) {
        return null;
      }

      const storage = analysis.storage;
      return {
        status: analysis.status,
        visionJobId: analysis.visionJobId,
        data: analysis.data,
        spriteURL: getSpritePublicUrl(storage),
      };
    }),

  generate: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const [proj] = await db
        .select({ id: project.id })
        .from(project)
        .where(eq(project.id, input.projectId))
        .limit(1);

      if (!proj) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const visionRun = await start(visionAnalysisWorkflow, [proj.id]);

      await db
        .insert(videoAnalysis)
        .values({
          projectId: proj.id,
          runId: visionRun.runId,
          status: "pending",
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .onConflictDoUpdate({
          target: videoAnalysis.projectId,
          set: {
            status: "pending",
            runId: visionRun.runId,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          },
        });

      return null;
    }),

  check: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const [analysis] = await db
        .select()
        .from(videoAnalysis)
        .where(eq(videoAnalysis.projectId, input.projectId))
        .limit(1);

      if (!analysis || !analysis.visionJobId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video analysis not found",
        });
      }
      const jobStatus = await checkObjectDetectJobStatus({
        jobId: analysis.visionJobId,
      });
      if (jobStatus === "completed") {
        await resumeHook(analysis.visionJobId, {
          job_id: analysis.visionJobId,
        });
      }
      return {
        status: jobStatus,
      };
    }),

  updateAnalysis: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        analysis: z.unknown(),
      }),
    )
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(videoAnalysis)
        .set({
          data: input.analysis as any,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(videoAnalysis.projectId, input.projectId))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video analysis not found",
        });
      }

      return updated;
    }),
});
