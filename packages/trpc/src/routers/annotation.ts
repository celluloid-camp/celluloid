import { prisma, UserRole } from '@celluloid/prisma';
import { toSrt } from '@celluloid/utils';
import { TRPCError } from '@trpc/server';
import { parse as toXML } from 'js2xmlparser';
import * as Papa from 'papaparse';
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
  edit: protectedProcedure
    .input(
      z.object({
        annotationId: z.string(), // identifier for the annotation to be edited
        text: z.string().min(1).optional(),
        startTime: z.number().optional(),
        stopTime: z.number().optional(),
        pause: z.boolean().optional(),
        projectId: z.string().optional(),
        extra: z.any().optional()
      }),
    )
    .mutation(async ({ input, ctx }) => {


      // Check if the annotation with the given ID exists
      const existingAnnotation = await prisma.annotation.findUnique({
        where: { id: input.annotationId },
      });

      if (!existingAnnotation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Annotation not found"
        }
        );
      }

      if (existingAnnotation.userId == ctx.user?.id) {
        // Perform the update
        const updatedAnnotation = await prisma.annotation.update({
          where: { id: input.annotationId },
          data: {
            userId: ctx.user?.id,
            text: input.text ?? existingAnnotation.text,
            startTime: input.startTime ?? existingAnnotation.startTime,
            stopTime: input.stopTime ?? existingAnnotation.stopTime,
            pause: input.pause ?? existingAnnotation.pause,
            projectId: input.projectId ?? existingAnnotation.projectId,
            extra: input.extra ?? existingAnnotation.extra
          },
        });

        return updatedAnnotation;
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Can't edit this annotation"
        }
        );
      }

    }),

  delete: protectedProcedure
    .input(
      z.object({
        annotationId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {

      // Check if the annotation with the given ID exists
      const existingAnnotation = await prisma.annotation.findUnique({
        where: { id: input.annotationId },
      });

      if (!existingAnnotation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Annotation not found"
        }
        );
      }

      if (existingAnnotation.userId == ctx.user?.id) {
        const annotation = await prisma.annotation.delete({
          where: { id: input.annotationId },
        });
        return annotation;
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Can't edit this annotation"
        }
        );

      }
    }),
  export: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        format: z.enum(["csv", "xml", "srt"])
      })
    ).query(async ({ input }) => {
      const { format, projectId } = input;

      const annotations = await prisma.annotation.findMany({
        where: { projectId: projectId },
        include: {
          comments: true
        },
        orderBy: {
          createdAt: 'desc',
        },
      });


      const formated = annotations.map((a) => ({
        startTime: a.startTime,
        endTime: a.stopTime,
        text: a.text,
        comments: a.comments.map((c) => c.text)
      }))

      let content = "";
      if (format === 'xml') {
        content = toXML("annotations", formated);
      } else if (format == "csv") {
        content = Papa.unparse(formated);
      } else if (format == "srt") {
        content = toSrt(formated);
      }
      return content
    })

});
