import { Prisma, prisma } from "@celluloid/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const defaultUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  username: true,
  role: true,
  firstname: true,
  lastname: true,
  bio: true,
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

export const UserSchema = z.object({
  id: z.string({ description: "The unique identifier for the user" }),
  username: z.string({ description: "The username for the user" }),
  role: z
    .string({
      description: "The role assigned to the user, either Admin or User",
    })
    .nullable(),
  initial: z.string({
    description: "The initial letter or string for user representation",
  }),
  color: z.string({ description: "The color code associated with the user" }),
});

export const userRouter = router({
  joinProject: protectedProcedure
    .input(
      z.object({
        shareCode: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await prisma.project.findUnique({
        where: { shareCode: input.shareCode },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "CODE_NOT_FOUND",
        });
      }

      if (project.userId === ctx.user?.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "PROJECT_OWNER_CANNOT_JOIN",
        });
      }

      await prisma.project.update({
        where: { id: project.id },
        data: {
          members: {
            create: [
              {
                userId: ctx.user?.id,
              },
            ],
          },
        },
      });
      return { projectId: project.id };
    }),

  me: publicProcedure.query(async (opts) => {
    const { ctx } = opts;
    if (ctx.user) {
      // Retrieve the user with the given ID
      const user = await prisma.user.findUnique({
        select: { ...defaultUserSelect, email: true },
        where: { id: ctx.user.id },
      });
      return user;
    }
    return null;
  }),
  update: protectedProcedure
    .input(
      z.object({
        username: z.string(),
        firstname: z.string().nullish(),
        lastname: z.string().nullish(),
        bio: z.string().nullish(),
        avatarStorageId: z.string().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.id) {
        // Find the project by its ID (you need to replace 'projectId' with the actual ID)
        const user = await prisma.user.findUnique({
          where: {
            id: ctx.user.id,
          },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const avatarStorageId = input.avatarStorageId;

        if (user.avatarStorageId != null && avatarStorageId == null) {
          await prisma.storage.delete({
            where: {
              id: user.avatarStorageId,
            },
          });
          // TODO: remove file with minio
        }

        const updatedUser = await prisma.user.update({
          where: {
            id: ctx.user.id,
          },
          data: {
            username: input.username || user.username,
            firstname: input.firstname || user.firstname,
            lastname: input.lastname || user.lastname,
            bio: input.bio || user.bio,
            avatarStorageId: avatarStorageId,
          },
        });

        return updatedUser;
      }
    }),
  byId: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async (opts) => {
      const { input } = opts;
      // Retrieve the user with the given ID
      const user = await prisma.user.findUnique({
        select: defaultUserSelect,
        where: { id: input.id },
      });
      return user;
    }),

  publicById: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async (opts) => {
      const { input } = opts;
      // Retrieve the user with the given ID
      const user = await prisma.user.findUnique({
        select: {
          id: true,
          username: true,
          color: true,
          role: true,
          avatar: {
            select: {
              id: true,
              publicUrl: true,
              path: true,
            },
          },
          bio: true,
          initial: true,
        },
        where: { id: input.id },
      });
      return user;
    }),

  projects: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      const items = await prisma.project.findMany({
        // select: defaultPostSelect,
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        where: {
          OR: [
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
        include: {
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
        const nextItem = items.pop();
        if (nextItem) {
          nextCursor = nextItem.id;
        }
      }

      return {
        items: items.reverse(),
        nextCursor,
      };
    }),
  publicProjects: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      const items = await prisma.project.findMany({
        // select: defaultPostSelect,
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        where: {
          userId: input.userId,
          public: true,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              color: true,
              initial: true,
              avatar: {
                select: {
                  id: true,
                  publicUrl: true,
                  path: true,
                },
              },
            },
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
        const nextItem = items.pop();
        if (nextItem) {
          nextCursor = nextItem.id;
        }
      }

      return {
        items: items.reverse(),
        nextCursor,
      };
    }),
});
