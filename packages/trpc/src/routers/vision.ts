import { prisma } from "@celluloid/prisma";
import { visionQueue, visionResultQueue } from "@celluloid/queue";
import { getJobResultsResultsJobIdGetResponse } from "@celluloid/vision/schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "../env";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const visionRouter = router({
  byProjectId: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { projectId } = input;

      // if (!ctx.user.id) {
      //   throw new TRPCError({
      //     code: 'UNAUTHORIZED',
      //     message: 'You must be logged in to view this note',
      //   });
      // }

      const analysis = await prisma.videoAnalysis.findUnique({
        where: { projectId: projectId },
        select: {
          status: true,
          visionJobId: true,
          processing: true,
          sprite: {
            select: {
              id: true,
              publicUrl: true,
              path: true,
            },
          },
        },
      });

      if (!analysis) {
        return null;
      }

      return analysis;
    }),

  generate: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { projectId } = input;

      const job = await visionQueue.add({
        projectId: projectId,
        callbackUrl: `${env.BASE_URL}/api/vision/webhook`,
      });

      await prisma.project.update({
        where: { id: projectId },
        data: {
          jobs: { create: { type: "vision", queueJobId: job.id } },
        },
      });

      return job.id;
    }),

  check: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { projectId } = input;

      const job = await visionResultQueue.add({
        projectId: projectId,
      });

      return job.id;
    }),
  updateAnalysis: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        analysis: getJobResultsResultsJobIdGetResponse,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { projectId } = input;

      const analysis = await prisma.videoAnalysis.update({
        where: { projectId: projectId },
        data: {
          processing: input.analysis,
        },
      });

      return analysis;
    }),
});
