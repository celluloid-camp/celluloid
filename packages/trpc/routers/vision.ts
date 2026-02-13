import { db } from "@celluloid/db";
// import { visionQueue, visionResultQueue } from "@celluloid/queue";
import { GetJobResultsResultsJobIdGetResponse } from "@celluloid/vision";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const visionRouter = router({
  byProjectId: publicProcedure
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

      const analysis = await db.videoAnalysis.findUnique({
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

      // const job = await visionQueue.add({
      //   projectId: projectId,
      //   callbackUrl: `${env.BASE_URL}/api/vision/webhook`,
      // });

      await db.project.update({
        where: { id: projectId },
        data: {
          jobs: { create: { type: "vision", queueJobId: null } },
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
    .mutation(async ({ input, ctx }) => {
      const { projectId } = input;

      // const job = await visionResultQueue.add({
      //   projectId: projectId,
      // });

      return null;
    }),
  updateAnalysis: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        analysis: GetJobResultsResultsJobIdGetResponse,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { projectId } = input;

      const analysis = await db.videoAnalysis.update({
        where: { projectId: projectId },
        data: {
          processing: input.analysis,
        },
      });

      return analysis;
    }),
});
