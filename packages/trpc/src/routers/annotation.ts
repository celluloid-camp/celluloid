import { Prisma, prisma, UserRole } from '@celluloid/prisma';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { protectedProcedure, publicProcedure, router } from '../trpc';

// const defaultPostSelect = Prisma.validator<Prisma.ProjectSelect>()({
//   id: true,
//   title: true,
//   text: true,
//   createdAt: true,
//   updatedAt: true,
// });


export const annotationRouter = router({
  byProjectId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;
      const annotations = await prisma.annotation.findMany({
        where: { projectId: id },
        include: {
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  role: true,
                  initial: true,
                  color: true
                }
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              role: true,
              initial: true,
              color: true
            }
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      // if (!project) {
      //   throw new TRPCError({
      //     code: 'NOT_FOUND',
      //     message: `No project with id '${id}'`,
      //   });
      // }
      return annotations;
    }),
  add: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1),
        startTime: z.number(),
        stopTime: z.number(),
        pause: z.boolean(),
        projectId: z.string(),
        extra: z.any()
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user && ctx.user.id && ctx.requirePermissions([UserRole.Teacher, UserRole.Admin])) {
        const annotation = await prisma.annotation.create({
          data: {
            userId: ctx.user?.id,
            text: input.text,
            startTime: input.startTime,
            stopTime: input.stopTime,
            pause: input.pause,
            projectId: input.projectId,
            extra: input.extra
          }
          // select: defaultPostSelect,
        });
        return annotation;
      }
    }),
  delete: protectedProcedure
    .input(
      z.object({
        annotationId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      //TODO : check if project owner or collaborator
      if (ctx.user && ctx.user.id) {
        const comment = await prisma.annotation.delete({
          where: { id: input.annotationId },
        });
        return comment;
      }
    }),
});
