import { EventEmitter } from "node:events";
import type { Annotation } from "@celluloid/prisma";
import { Prisma, prisma } from "@celluloid/prisma";
import { toSrt } from "@celluloid/utils";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { username } from "better-auth/plugins";
import { parse as toXML } from "js2xmlparser";
import Papa from "papaparse";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

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
      path: true,
    },
  },
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
                select: defaultUserSelect,
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          user: {
            select: defaultUserSelect,
          },
        },
        orderBy: {
          createdAt: "desc",
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
      ee.on("change", onChange);
      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        ee.off("change", onChange);
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
        extra: z.any(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.id) {
        const annotation = await prisma.annotation.create({
          data: {
            userId: ctx.user?.id,
            text: input.text,
            startTime: input.startTime,
            stopTime: input.stopTime,
            pause: input.pause,
            projectId: input.projectId,
            extra: input.extra,
          },
          // select: defaultPostSelect,
        });

        ee.emit("change", annotation);
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
        extra: z.any().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Check if the annotation with the given ID exists
      const annotation = await prisma.annotation.findUnique({
        where: { id: input.annotationId },
        include: {
          project: true,
        },
      });

      if (!annotation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Annotation not found",
        });
      }

      if (
        annotation.userId === ctx.user?.id ||
        ctx.user?.role === "admin" ||
        annotation.project.userId === ctx.user?.id
      ) {
        // Perform the update
        const updatedAnnotation = await prisma.annotation.update({
          where: { id: input.annotationId },
          data: {
            text: input.text ?? annotation.text,
            startTime: input.startTime ?? annotation.startTime,
            stopTime: input.stopTime ?? annotation.stopTime,
            pause: input.pause ?? annotation.pause,
            projectId: input.projectId ?? annotation.projectId,
            extra: input.extra ?? annotation.extra,
          },
        });

        ee.emit("change", updatedAnnotation);
        return updatedAnnotation;
      }
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Can't edit this annotation",
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        annotationId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Check if the annotation with the given ID exists
      const annotation = await prisma.annotation.findUnique({
        where: { id: input.annotationId },
        include: {
          project: true,
        },
      });

      if (!annotation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Annotation not found",
        });
      }

      if (
        annotation.userId === ctx.user?.id ||
        ctx.user?.role === "admin" ||
        annotation.project.userId === ctx.user?.id
      ) {
        const annotation = await prisma.annotation.delete({
          where: { id: input.annotationId },
        });
        ee.emit("change", annotation);
        return annotation;
      }
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Can't edit this annotation",
      });
    }),
  export: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        format: z.enum(["csv", "xml", "srt"]),
      }),
    )
    .mutation(async ({ input }) => {
      const { format, projectId } = input;

      const annotations = await prisma.annotation.findMany({
        where: { projectId: projectId },
        include: {
          comments: true,
          user: {
            select: {
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const formated = annotations.map((a) => ({
        startTime: a.startTime,
        endTime: a.stopTime,
        text: a.text,
        comments: a.comments.map((c) => c.text),
        contextX: a.extra ? a.extra.relativeX : null,
        contextY: a.extra ? a.extra.relativeY : null,
        username: a.user.username,
      }));

      let content = "";
      if (format === "xml") {
        content = toXML("annotations", formated, {
          cdataKeys: ["comments", "text"],
        });
      } else if (format === "csv") {
        const sorted = formated.sort((a, b) => a.startTime - b.startTime);
        content = Papa.unparse(sorted);
      } else if (format === "srt") {
        content = toSrt(formated);
      }
      return content;
    }),
});
