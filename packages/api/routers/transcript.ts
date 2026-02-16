import { db, project, projectTranscript } from "@celluloid/db";
import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
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

  generate: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async () => {
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
      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update transcript",
        });
      }

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
