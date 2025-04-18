import { Prisma, prisma } from "@celluloid/prisma";
import {
  convertCaptionsToTranscript,
  transcriptsQueue,
} from "@celluloid/queue";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { getPeerTubeCaptions } from "@celluloid/utils";
import { publicProcedure, router } from "../trpc";

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
});
