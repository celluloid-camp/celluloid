import { type Prisma, prisma } from "@celluloid/db";
import { generateUniqueShareName } from "@celluloid/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, router } from "../trpc";

export const adminRouter = router({
  listProjects: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        skip: z.number().min(0).nullish(),
        searchTerm: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const skip = input.skip ?? 0;

      const where: Prisma.ProjectWhereInput = input.searchTerm
        ? {
          user: {
            username: { contains: input.searchTerm, mode: "insensitive" },
          },
        }
        : {};

      const total = await prisma.project.count({
        where: where as any,
      });

      const items = await prisma.project.findMany({
        take: limit,
        skip: skip,
        where: where as any,
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
          user: true,
          members: true,
          _count: true,
        },
        orderBy: {
          publishedAt: "desc",
        },
      });
      return {
        items,
        total,
      };
    }),
  getUserById: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const user = await prisma.user.findUnique({
          select: {
            id: true,
            username: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
          },
          where: { id: input.id },
        });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }
        return user;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve user",
        });
      }
    }),
  updateUser: adminProcedure
    .input(
      z.object({
        username: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        userId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.findUnique({
        where: {
          id: input.userId,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      try {
        await prisma.user.update({
          where: {
            id: input.userId,
          },
          data: {
            username: input.username,
            firstname: input.firstName,
            lastname: input.lastName,
          },
        });

        return true;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
        });
      }
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
          chapters: {
            select: {
              id: true,
            },
          },
          playlist: {
            include: {
              projects: true,
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
              user: true,
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

      return project;
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
      const project = await prisma.project.findUnique({
        where: {
          id: input.projectId,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      await prisma.projectNote.deleteMany({
        where: {
          projectId: input.projectId,
        },
      });

      const deletedProject = await prisma.project.delete({
        where: {
          id: input.projectId,
        },
      });

      return deletedProject;
    }),
  projectsByUser: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        limit: z.number().min(1).max(100).nullish(),
        skip: z.number().min(0).nullish(),
      }),
    )
    .query(async ({ input }) => {
      const { userId } = input;
      const limit = input.limit ?? 50;
      const skip = input.skip ?? 0;

      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Get total count for pagination
        const total = await prisma.project.count({
          where: {
            userId,
          },
        });

        const items = await prisma.project.findMany({
          take: limit,
          skip: skip,
          where: {
            userId,
          },
          select: {
            id: true,
            title: true,
            description: true,
            publishedAt: true,
            public: true,
            collaborative: true,
            shared: true,
            shareCode: true,
            shareExpiresAt: true,
            duration: true,
          },
          orderBy: {
            publishedAt: "desc",
          },
        });

        return {
          items,
          total,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve projects",
        });
      }
    }),
  deleteUserProject: adminProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Find the project by its ID and verify it belongs to the specified user
        const project = await prisma.project.findUnique({
          where: {
            id: input.projectId,
          },
        });

        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found or doesn't belong to specified user",
          });
        }

        // First delete all related project notes
        await prisma.projectNote.deleteMany({
          where: {
            projectId: input.projectId,
          },
        });

        const deletedProject = await prisma.project.delete({
          where: {
            id: input.projectId,
          },
        });
        return deletedProject;
      } catch (error) {
        console.log("error", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete user's project",
        });
      }
    }),
  getProjectById: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const project = await prisma.project.findUnique({
          where: { id: input.id },
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });

        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No project with id '${input.id}'`,
          });
        }

        return project;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve project",
        });
      }
    }),
  updateProject: adminProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        title: z.string(),
        description: z.string(),
        public: z.boolean().optional(),
        shared: z.boolean().optional(),
        collaborative: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const project = await prisma.project.findUnique({
          where: {
            id: input.projectId,
          },
        });

        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }

        const updatedProject = await prisma.project.update({
          where: {
            id: input.projectId,
          },
          data: {
            title: input.title,
            description: input.description,
            public: input.public,
            shared: input.shared,
            collaborative: input.collaborative,
          },
        });

        return updatedProject;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update project",
        });
      }
    }),
});
