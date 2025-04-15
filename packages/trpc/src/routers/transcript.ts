import { Prisma, prisma } from '@celluloid/prisma';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { convertCaptionsToTranscript } from '@celluloid/queue';

import { publicProcedure, router } from '../trpc';
import { getPeerTubeCaptions } from '@celluloid/utils';

export const transcriptRouter = router({
  byProjectId: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { projectId } = input;

      if (!ctx.user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view this note',
        });
      }

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

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project || !project.videoId || !project.host) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      const captions = await getPeerTubeCaptions({
        videoId: project.videoId,
        host: project.host,
      });
      if (captions.length > 0 && captions[0]) {
        const transcript = await convertCaptionsToTranscript(captions[0]);

        await prisma.projectTranscript.upsert({
          where: { projectId: projectId },
          update: { content: transcript },
          create: { projectId: projectId, content: transcript, language: captions[0].language, entries: captions[0].entries },
        });

      }



      return null;
    }),
});
