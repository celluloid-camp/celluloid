import { type Prisma, prisma } from "@celluloid/prisma";
import { generateUniqueShareName } from "@celluloid/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  adminProcedure,
  router,
} from "../trpc";

export const adminRouter = router({
  listProjects: adminProcedure
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

      const withterm: Prisma.ProjectWhereInput = term
        ? {
          title: {
            search: `%${term}%`,
          },
        }
        : {};

      const items = await prisma.project.findMany({
        // select: defaultPostSelect,
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        where: {
          ...withterm,
        },
        select: {
          id: true,
          userId: true,
          title: true,
          description: true,
          publishedAt: true,
          public: true,
          collaborative: true,
          shared: true,
          shareCode: true,
          shareExpiresAt: true,
          duration: true,
          thumbnailURL: true,
          metadata: false,
          keywords: true,
          user: true,
          members: true,
          _count: true,
        },
        cursor: cursor
          ? {
            id: cursor,
          }
          : undefined,
        orderBy: {
          publishedAt: "desc",
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        // Remove the last item and use it as next cursor
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const nextItem = items.pop()!;
        nextCursor = nextItem.id;
      }

      return {
        items: items.reverse(),
        nextCursor,
      };
    }),
  byId: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const project = await prisma.project.findUnique({
        where: { id },
        select: {
          user: true,
          chapterJob: {
            select: {
              id: true,
              error: true,
              finishedAt: true,
              progress: true,
            },
          },
          playlist: {
            include: {
              projects: true
            },
          },
          _count: {
            select: {
              annotations: true,
              members: true,
            },
          },
          members: {
            include: {
              user: true
            },
          },
        },
        // select: defaultPostSelect,
      });
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No project with id '${id}'`,
        });
      }

      return project
    }),

  update: adminProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string().nullish(),
        description: z.string().nullish(),
        public: z.boolean().nullish(),
        collaborative: z.boolean().nullish(),
        shared: z.boolean().default(false),
        keywords: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ input, ctx }) => {

      // Find the project by its ID (you need to replace 'projectId' with the actual ID)
      const project = await prisma.project.findUnique({
        where: {
          id: input.projectId,
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      let shareCode = project.shareCode;

      const newTitle =
        input.title !== project.title ? input.title : project.title;

      if (project.shared !== input.shared) {
        if (input.shared && newTitle) {
          console.log("generate new share code with:", newTitle);
          shareCode = generateUniqueShareName(newTitle);
        } else {
          shareCode = null;
        }
      }
      const updatedProject = await prisma.project.update({
        where: {
          id: project.id,
        },
        data: {
          title: input.title || project.title,
          description: input.description || project.description,
          public: input.public !== null ? input.public : false,
          collaborative:
            input.collaborative !== null ? input.collaborative : false,
          shared: input.shared !== null ? input.shared : false,
          keywords: input.keywords || project.keywords,
          shareCode,
        },
      });

      return updatedProject;

    }),
  delete: adminProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Find the project by its ID (you need to replace 'projectId' with the actual ID)
      const project = await prisma.project.findUnique({
        where: {
          id: input.projectId,
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const deletedProject = await prisma.project.delete({
        where: {
          id: input.projectId, // Replace projectId with the actual ID of the project you want to delete
        },
      });

      return deletedProject;

    }),
});
