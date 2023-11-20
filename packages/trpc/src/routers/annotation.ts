import { prisma, UserRole } from '@celluloid/prisma';
import { Annotation } from '@celluloid/prisma';
import { Prisma } from '@celluloid/prisma';
import { toSrt } from '@celluloid/utils';
import { TRPCError } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import { EventEmitter } from 'events';
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
      publicUrl: true,
      path: true
    }
  }
});


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
                select: defaultUserSelect
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          user: {
            select: defaultUserSelect
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
  onChange: publicProcedure.subscription(() => {
    // return an `observable` with a callback which is triggered immediately
    return observable<Annotation>((emit) => {
      const onChange = (data: Annotation) => {
        // emit data to client
        emit.next(data);
      };
      // trigger `onAdd()` when `add` is triggered in our event emitter
      ee.on('change', onChange);
      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        ee.off('change', onChange);
      };
    });
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
      if (ctx.user && ctx.user.id) {
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

        ee.emit('change', annotation);
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

      if (existingAnnotation.userId == ctx.user?.id || ctx.user.role == UserRole.Admin) {
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

        ee.emit('change', updatedAnnotation);
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

      if (existingAnnotation.userId == ctx.user?.id || ctx.user.role == UserRole.Admin) {
        const annotation = await prisma.annotation.delete({
          where: { id: input.annotationId },
        });

        ee.emit('change', annotation);

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
    ).mutation(async ({ input }) => {
      const { format, projectId } = input;

      const annotations = await prisma.annotation.findMany({
        where: { projectId: projectId },
        include: {
          comments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const formated = annotations.map((a) => ({
        startTime: a.startTime,
        endTime: a.stopTime,
        text: a.text,
        comments: a.comments.map((c) => c.text),
        contextX: a.extra ? a.extra.relativeX : null,
        contextY: a.extra ? a.extra.relativeY : null,
      }))

      let content = "";
      if (format === 'xml') {
        content = toXML("annotations", formated, { cdataKeys: ['comments', 'text'] });
      } else if (format == "csv") {
        content = Papa.unparse(formated);
      } else if (format == "srt") {
        content = toSrt(formated);
      }
      return content
    })

});
