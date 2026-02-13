import { db, Prisma } from "@celluloid/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../trpc";

export const noteRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        term: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor, term } = input;

      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view this note",
        });
      }

      const items = await db.projectNote.findMany({
        // select: defaultPostSelect,
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        where: {
          userId: ctx.user.id,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        orderBy: {
          createdAt: "desc",
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        // Remove the last item and use it as next cursor
        const nextItem = items.pop()!;
        nextCursor = nextItem.id;
      }

      return {
        items: items.reverse(),
        nextCursor,
      };
    }),
  byProjectId: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { projectId } = input;

      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view this note",
        });
      }

      const note = await db.projectNote.findUnique({
        where: {
          projectId_userId: { projectId: projectId, userId: ctx.user.id },
        },
        select: {
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!note) {
        return null;
      }

      return note;
    }),

  update: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        content: z.any(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.id) {
        // Find the project by its ID (you need to replace 'projectId' with the actual ID)
        const project = await db.project.findUnique({
          where: {
            id: input.projectId,
          },
        });

        if (!project) {
          throw new Error("Project not found");
        }

        const result = await db.projectNote.upsert({
          where: {
            projectId_userId: {
              projectId: project.id,
              userId: ctx.user.id,
            },
          },
          update: {
            content: input.content,
          },
          create: {
            projectId: project.id,
            userId: ctx.user.id,
            content: input.content,
          },
        });

        return result;
      }
    }),
});
