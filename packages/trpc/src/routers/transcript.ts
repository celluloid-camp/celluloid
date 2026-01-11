import { Prisma, prisma } from "@celluloid/db";
import {
  convertCaptionsToTranscript,
  transcriptsQueue,
} from "@celluloid/queue";
import { getPeerTubeCaptions } from "@celluloid/utils";
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

      const transcript = await prisma.projectTranscript.findUnique({
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

      const job = await transcriptsQueue.add({ projectId: projectId });

      await prisma.project.update({
        where: { id: projectId },
        data: {
          jobs: { create: { type: "transcript", queueJobId: job.id } },
        },
      });

      return job.id;
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
      const project = await prisma.project.findUnique({
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
      const transcript = await prisma.projectTranscript.upsert({
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
