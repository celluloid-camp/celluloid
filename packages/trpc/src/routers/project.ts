import { Prisma, prisma } from "@celluloid/prisma";
import { generateUniqueShareName } from "@celluloid/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { chaptersQueue, transcriptsQueue } from "@celluloid/queue";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { PlaylistSchema } from "./playlist";
import { UserSchema } from "./user";

export const defaultProjectSelect = Prisma.validator<Prisma.ProjectSelect>()({
  id: true,
  videoId: true,
  userId: true,
  title: true,
  description: true,
  host: true,
  publishedAt: true,
  public: true,
  collaborative: true,
  shared: true,
  shareCode: true,
  shareExpiresAt: true,
  extra: true,
  playlistId: true,
  duration: true,
  thumbnailURL: true,
  metadata: false,
  keywords: true,
});

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

const MemberSchema = z.object({
  id: z.number(),
  userId: z.string(),
  projectId: z.string(),
  user: UserSchema,
});

export const ProjectSchema = z.object({
  id: z.string(),
  videoId: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  host: z.string(),
  publishedAt: z.string(),
  public: z.boolean(),
  collaborative: z.boolean(),
  shared: z.boolean(),
  shareCode: z.string().nullable(),
  shareExpiresAt: z.null().nullable(),
  extra: z.record(z.unknown()),
  playlistId: z.string(),
  duration: z.number(),
  thumbnailURL: z.string(),
  user: UserSchema,
  playlist: PlaylistSchema,
  members: z.array(MemberSchema),
  _count: z.object({
    annotations: z.number(),
    members: z.number(),
  }),
});

export const projectRouter = router({
  list: publicProcedure
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
          OR: [
            {
              public: true,
            },
            { userId: ctx.user ? ctx.user.id : undefined },
            ctx.user
              ? {
                members: {
                  some: {
                    userId: ctx.user.id,
                  },
                },
              }
              : {},
          ],
        },
        select: {
          ...defaultProjectSelect,
          user: {
            select: defaultUserSelect,
          },
          members: true,
          playlist: {
            include: {
              _count: true,
            },
          },
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
        const nextItem = items.pop()!;
        nextCursor = nextItem.id;
      }

      return {
        items: items.reverse(),
        nextCursor,
      };
    }),
  byId: publicProcedure
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
          ...defaultProjectSelect,
          user: {
            select: defaultUserSelect,
          },
          jobs: {
            select: {
              type: true,
              queueJob: {
                select: {
                  id: true,
                  finishedAt: true,
                  progress: true,
                },
              },
            },
          },
          playlist: {
            include: {
              projects: {
                select: defaultProjectSelect,
              },
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
              user: {
                select: defaultUserSelect,
              },
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

      return {
        ...project,
        editable:
          ctx.user &&
          (ctx.user.id === project.userId || ctx.user.role === "admin"),
        deletable:
          ctx.user &&
          (ctx.user.id === project.userId || ctx.user.role === "admin"),
        annotable:
          ctx.user &&
          (ctx.user.id === project.userId ||
            ctx.user.role === "admin" ||
            (project.members.some(
              (m) => ctx.user && m.userId === ctx.user.id,
            ) &&
              project.collaborative)),
        commentable:
          ctx.user &&
          (ctx.user.id === project.userId ||
            ctx.user.role === "admin" ||
            (project.members.some(
              (m) => ctx.user && m.userId === ctx.user.id,
            ) &&
              project.collaborative)),
      };
    }),
  add: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string(),
        objective: z.string(),
        levelStart: z.number(),
        levelEnd: z.number(),
        public: z.boolean(),
        collaborative: z.boolean(),
        shared: z.boolean(),
        videoId: z.string(),
        duration: z.number(),
        thumbnailURL: z.string().url(),
        metadata: z.any(),
        host: z.string(),
        keywords: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.id && ctx.requireRoles(["teacher", "admin"])) {
        const project = await prisma.project.create({
          data: {
            userId: ctx.user?.id,
            title: input.title,
            description: input.description,
            videoId: input.videoId,
            host: input.host,
            objective: input.objective,
            levelStart: input.levelStart,
            levelEnd: input.levelEnd,
            public: input.public,
            collaborative: input.collaborative,
            shared: input.shared,
            duration: input.duration,
            thumbnailURL: input.thumbnailURL,
            metadata: input.metadata,
            shareCode: input.shared
              ? generateUniqueShareName(input.title)
              : null,
            keywords: input.keywords,
          },
          // select: defaultPostSelect,
        });
        const jobId = await chaptersQueue.add({ projectId: project.id });
        const transcriptJobId = await transcriptsQueue.add({
          projectId: project.id,
        });
        await prisma.project.update({
          where: { id: project.id },
          data: {
            jobs: {
              create: [
                {
                  type: "chapter",
                  queueJob: {
                    connect: {
                      id: jobId.id,
                    },
                  },
                },
                {
                  type: "transcript",
                  queueJob: {
                    connect: {
                      id: transcriptJobId.id,
                    },
                  },
                },
              ],
            },
          },
        });
        return project;
      }
    }),
  update: protectedProcedure
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
          select: defaultProjectSelect,
        });

        return updatedProject;
      }
    }),
  delete: protectedProcedure
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

        const deletedProject = await prisma.project.delete({
          where: {
            id: input.projectId, // Replace projectId with the actual ID of the project you want to delete
          },
        });

        return deletedProject;
      }
    }),
});
