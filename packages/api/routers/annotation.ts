import { EventEmitter } from "node:events";
import {
  AnnotationSelect,
  annotation,
  comment,
  db,
  project,
} from "@celluloid/db";
import { getDbErrorMessage } from "@celluloid/db/utils";
import { defaultUserSelect } from "@celluloid/db/validator";
import { getNotificationsClient } from "@celluloid/notifications";
import { toSrt } from "@celluloid/utils";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { username } from "better-auth/plugins";
import { desc, eq } from "drizzle-orm";
import { parse as toXML } from "js2xmlparser";
import Papa from "papaparse";
import { z } from "zod";
import { keys } from "../keys";
import { protectedProcedure, publicProcedure, router } from "../trpc";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();

export const annotationRouter = router({
  byProjectId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;
      try {
        const annotations = await db.query.annotation.findMany({
          where: eq(annotation.projectId, id),
          with: {
            comments: {
              with: {
                user: {
                  columns: {
                    id: true,
                    username: true,
                    initial: true,
                    color: true,
                    image: true,
                  },
                },
              },
              orderBy: desc(comment.createdAt),
            },
            user: {
              columns: {
                id: true,
                username: true,
                initial: true,
                color: true,
                image: true,
              },
            },
          },
          orderBy: desc(annotation.createdAt),
        });
        // if (!project) {
        //   throw new TRPCError({
        //     code: 'NOT_FOUND',
        //     message: `No project with id '${id}'`,
        //   });
        // }
        return annotations;
      } catch (error) {
        const { message } = getDbErrorMessage(error);
        console.error(message);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }
    }),
  onChange: publicProcedure.subscription(() => {
    // return an `observable` with a callback which is triggered immediately
    return observable<AnnotationSelect>((emit) => {
      const onChange = (data: AnnotationSelect) => {
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
      const projectOwner = await db.query.project.findFirst({
        where: eq(project.id, input.projectId),
        columns: {
          userId: true,
          title: true,
        },
      });

      if (!projectOwner) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const [record] = await db
        .insert(annotation)
        .values({
          userId: ctx.user?.id,
          text: input.text,
          startTime: input.startTime,
          stopTime: input.stopTime,
          pause: input.pause,
          projectId: input.projectId,
          extra: input.extra,
        })
        .returning();

      ee.emit("change", record);

      if (projectOwner.userId !== ctx.user.id) {
        await getNotificationsClient().workflows.trigger("new-annotation", {
          recipients: [
            {
              id: projectOwner.userId,
            },
          ],
          data: {
            message: `Nouvelle annotation de ${ctx.user?.username} sur le projet ${projectOwner?.title}`,
            link: `${keys().BASE_URL}/project/${input.projectId}`,
          },
        });
      }

      return record;
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
      const record = await db.query.annotation.findFirst({
        where: eq(annotation.id, input.annotationId),
        with: {
          project: {
            columns: {
              userId: true,
            },
          },
        },
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Annotation not found",
        });
      }

      if (
        record.userId === ctx.user.id ||
        ctx.user.role === "admin" ||
        record.project.userId === ctx.user.id
      ) {
        // Perform the update
        const updatedAnnotation = await db.update(annotation).set({
          text: input.text ?? record.text,
          startTime: input.startTime ?? record.startTime,
          stopTime: input.stopTime ?? record.stopTime,
          pause: input.pause ?? record.pause,
          projectId: input.projectId ?? record.projectId,
          extra: input.extra ?? record.extra,
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
      const record = await db.query.annotation.findFirst({
        where: eq(annotation.id, input.annotationId),
        with: {
          project: {
            columns: {
              userId: true,
            },
          },
        },
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Annotation not found",
        });
      }

      if (
        record.userId === ctx.user.id ||
        ctx.user.role === "admin" ||
        record.project.userId === ctx.user.id
      ) {
        const deleted = await db
          .delete(annotation)
          .where(eq(annotation.id, input.annotationId));
        ee.emit("change", deleted);
        return deleted;
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

      const annotations = await db.query.annotation.findMany({
        where: eq(annotation.projectId, projectId),
        with: {
          comments: true,
          user: {
            columns: { username: true },
          },
        },
        orderBy: desc(annotation.createdAt),
      });

      const formated = annotations.map((a) => ({
        startTime: a.startTime,
        endTime: a.stopTime,
        text: a.text,
        comments: a.comments.map((c) => c.text),
        contextX: a.extra ? a.extra.x : null,
        contextY: a.extra ? a.extra.y : null,
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
