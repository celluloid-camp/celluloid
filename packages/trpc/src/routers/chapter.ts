import { prisma, UserRole } from '@celluloid/prisma';
import type { Annotation } from '@celluloid/prisma';
import { Prisma } from '@celluloid/prisma';
import { toSrt } from '@celluloid/utils';
import { TRPCError } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import { EventEmitter } from 'node:events';
import { parse as toXML } from 'js2xmlparser';
import Papa from 'papaparse';
import { z } from 'zod';

import { protectedProcedure, publicProcedure, router } from '../trpc';


// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();

export const defaultUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  username: true,
  role: true,
  initial: true,
  color: true,
  avatar: {
    select: {
      id: true,
      //@ts-expect-error dynamic
      publicUrl: true,
      path: true
    }
  }
});


export const chapterRouter = router({
  byProjectId: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { projectId } = input;
      const chapters = await prisma.chapter.findMany({
        where: { projectId },
        include: {
          thumbnail: {
            select: {
              id: true,
              publicUrl: true,
              path: true
            }
          },
          lastEditedBy: {
            select: defaultUserSelect
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      });
      // if (!project) {
      //   throw new TRPCError({
      //     code: 'NOT_FOUND',
      //     message: `No project with id '${id}'`,
      //   });
      // }
      return chapters;
    }),
});
