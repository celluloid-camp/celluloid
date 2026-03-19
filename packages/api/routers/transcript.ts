import { db, project, projectTranscript } from "@celluloid/db";
import { videoTranscriptWorkflow } from "@celluloid/workflows/transcript";
import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { start } from "workflow/api";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const transcriptRouter = router({
  byProjectId: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const [transcript] = await db
        .select({
          content: projectTranscript.content,
          createdAt: projectTranscript.createdAt,
          updatedAt: projectTranscript.updatedAt,
        })
        .from(projectTranscript)
        .where(eq(projectTranscript.projectId, input.projectId))
        .limit(1);

      return transcript ?? null;
    }),

  generate: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [proj] = await db
        .select({ id: project.id, userId: project.userId })
        .from(project)
        .where(eq(project.id, input.projectId))
        .limit(1);

      if (!proj) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (proj.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this transcript",
        });
      }

      const transcriptRun = await start(videoTranscriptWorkflow, [proj.id]);

      await db
        .update(project)
        .set({
          transcriptProcessingStatus: "not_started",
          transcriptProcessingRunId: transcriptRun.runId,
        })
        .where(eq(project.id, proj.id));

      return null;
    }),

  update: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [proj] = await db
        .select({ userId: project.userId })
        .from(project)
        .where(eq(project.id, input.projectId))
        .limit(1);

      if (!proj) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (proj.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this transcript",
        });
      }

      const [existing] = await db
        .select()
        .from(projectTranscript)
        .where(eq(projectTranscript.projectId, input.projectId))
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(projectTranscript)
          .set({
            content: input.content,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(projectTranscript.projectId, input.projectId))
          .returning();
        return updated!;
      }

      const [created] = await db
        .insert(projectTranscript)
        .values({
          projectId: input.projectId,
          content: input.content,
          language: "en",
          entries: {},
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .returning();

      return created!;
    }),
});
