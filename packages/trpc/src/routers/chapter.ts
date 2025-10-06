import { EventEmitter } from "node:events";
import { Prisma, prisma } from "@celluloid/prisma";
import { chaptersQueue } from "@celluloid/queue";
import { TRPCError } from "@trpc/server";
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
              path: true,
            },
          },
          lastEditedBy: {
            select: defaultUserSelect,
          },
        },
        orderBy: {
          startTime: "asc",
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
  generateChapters: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.id && ctx.requireRoles(["teacher", "admin"])) {
        // Find the project by its ID (you need to replace 'projectId' with the actual ID)
        const project = await prisma.project.findUnique({
          where: {
            id: input.projectId,
            userId: ctx.user.id,
          },
        });

        if (!project) {
          throw new Error("Project not found");
        }

        const jobId = await chaptersQueue.add({ projectId: project.id });
        const projectJob = await prisma.projectQueueJob.create({
          data: {
            projectId: project.id,
            type: "chapter",
            queueJobId: jobId.id,
          },
        });
        console.log("job enqueued", jobId);
        return projectJob;
      }
    }),
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        startTime: z.number(),
        endTime: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        select: {
          userId: true,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (ctx.user?.role === "admin" || project.userId === ctx.user?.id) {
        const chapter = await prisma.chapter.create({
          data: {
            projectId: input.projectId,
            startTime: input.startTime,
            endTime: input.endTime,
            title: input.title,
            description: input.description,
          },
          select: {
            id: true,
          },
        });

        if (!chapter) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to create chapter",
          });
        }
        return chapter;
      }

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Can't edit this annotation",
      });
    }),
  edit: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        chapterId: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const chapter = await prisma.chapter.findUnique({
        where: { id: input.chapterId },
        include: {
          project: true,
        },
      });

      if (!chapter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Annotation not found",
        });
      }

      if (
        ctx.user?.role === "admin" ||
        chapter.project.userId === ctx.user?.id
      ) {
        // Perform the update
        const updatedChapter = await prisma.chapter.update({
          where: { id: input.chapterId },
          data: {
            title: input.title ?? chapter.title,
            description: input.description ?? chapter.description,
          },
        });

        // ee.emit('change', updatedChapter);
        return updatedChapter;
      }

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Can't edit this annotation",
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        chapterId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Check if the annotation with the given ID exists
      const chapter = await prisma.chapter.findUnique({
        where: { id: input.chapterId },
        include: {
          project: true,
        },
      });

      if (!chapter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "chapter not found",
        });
      }

      if (
        ctx.user?.role === "admin" ||
        chapter.project.userId === ctx.user?.id
      ) {
        const chapter = await prisma.chapter.delete({
          where: { id: input.chapterId },
        });
        // ee.emit('change', chapter);
        return chapter;
      }
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Can't edit this chapter",
      });
    }),
  reset: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
        select: {
          userId: true,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (ctx.user?.role === "admin" || project.userId === ctx.user?.id) {
        // Check if the annotation with the given ID exists
        await prisma.chapter.deleteMany({
          where: { projectId: input.projectId },
        });

        await prisma.projectQueueJob.delete({
          where: { id: input.projectId, type: "chapter" },
        });

        // ee.emit('change', chapter);
        return;
      }
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Can't edit this chapter",
      });
    }),
});
