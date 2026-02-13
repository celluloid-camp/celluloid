import { db } from "@celluloid/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const transcriptRouter = router({
  byProjectId: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { projectId } = input;

      // if (!ctx.user?.id) {
      //   throw new TRPCError({
      //     code: 'UNAUTHORIZED',
      //     message: 'You must be logged in to view this note',
      //   });
      // }

      const transcript = await db.projectTranscript.findUnique({
        where: { projectId: projectId },
        select: {
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!transcript) {
        return null;
      }

      return transcript;
    }),

  generate: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { projectId } = input;

      // const job = await transcriptsQueue.add({ projectId: projectId });

      await db.project.update({
        where: { id: projectId },
        data: {
          jobs: { create: { type: "transcript", queueJobId: null } },
        },
      });

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

      // Check if user is project owner or admin
      const project = await db.project.findUnique({
        where: { id: input.projectId },
        select: { userId: true },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (project.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this transcript",
        });
      }

      // Update or create transcript
      const transcript = await db.projectTranscript.upsert({
        where: {
          projectId: input.projectId,
        },
        update: {
          content: input.content,
        },
        create: {
          projectId: input.projectId,
          content: input.content,
          language: "en", // Default language, can be made configurable
          entries: {},
        },
      });

      return transcript;
    }),
});
