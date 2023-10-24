import { passport, SigninStrategy } from "@celluloid/passport";
import { Prisma, prisma, UserRole } from "@celluloid/prisma"
import { compareCodes, generateOtp, hashPassword } from "@celluloid/utils";
import { TRPCError } from "@trpc/server";
import { z } from 'zod';

import { sendConfirmationCode, sendPasswordReset } from "../mailer/sendMail";
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const defaultUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  username: true,
  role: true,
  initial: true,
  color: true,
});


export const UserSchema = z.object({
  id: z.string({ description: 'The unique identifier for the user' }),
  username: z.string({ description: 'The username for the user' }),
  role: z.nativeEnum(UserRole, { description: 'The role assigned to the user, either Admin or User' }).nullable(),
  initial: z.string({ description: 'The initial letter or string for user representation' }),
  color: z.string({ description: 'The color code associated with the user' })
});


export const userRouter = router({
  login: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/login',
        description: 'This endpoint allows a user to login.'
      }
    })
    .input(
      z.object({
        username: z.string({ description: 'The username of the user' }),
        password: z.string({ description: 'The password for the user' })
      }),
    ).output(UserSchema.nullable())
    .mutation(async ({ ctx, input }) => {

      ctx.req.body = input;

      await new Promise<Express.User | void>((resolve, reject) => {
        passport.authenticate(SigninStrategy.LOGIN, {
          failWithError: true
        })(ctx.req, ctx.res, (err: Error, user: Express.User) => {
          if (err) return reject(err);
          resolve(user);
        })
      }).catch(err => {
        console.log(err.name);

        if (err?.name === 'AuthenticationError') {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Incorrect username or password.'
          })
        } else if (err?.name === "UserNotConfirmed") {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'UserNotConfirmed'
          })
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: err
        })
      })

      const user = await prisma.user.findFirst({
        select: defaultUserSelect,
        where: {
          OR: [{ email: input.username }, { username: input.username, }]
        }
      });

      return user;
    }),
  forgot: publicProcedure.input(
    z.object({
      email: z.string()
    }),
  ).mutation(async ({ ctx, input }) => {
    const user = await prisma.user.findFirst({
      select: { ...defaultUserSelect, email: true },
      where: {
        OR: [{ email: input.email }, { username: input.email, }]
      }
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Email or username not found`,
      });
    }
    if (!user.email) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `User account doesn't have email address`,
      });
    }

    const otp = generateOtp();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        code: otp,
        codeGeneratedAt: new Date()
      }
    })
    await sendPasswordReset({ email: user.email, username: user.username, code: otp })
    return { status: true }
  }),

  recover: publicProcedure.input(
    z.object({
      username: z.string(),
      code: z.string(),
      password: z.string().min(8)
    }),
  ).mutation(async ({ ctx, input }) => {
    const user = await prisma.user.findFirst({
      select: { ...defaultUserSelect, email: true, code: true },
      where: {
        OR: [{ email: input.username }, { username: input.username, }]
      }
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Email or username not found`,
      });
    }

    if (!compareCodes(input.code, user.code || "")) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Failed to recover account, code invalid`
      });
    }

    const newUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashPassword(input.password),
        code: null,
        codeGeneratedAt: null,
        confirmed: true
      }
    })

    await new Promise((resolve) => ctx.req.login(newUser, () => resolve(null)));

    return { status: true }

  }),

  register: publicProcedure.input(
    z.object({
      username: z.string(),
      email: z.string(),
      password: z.string().min(8)
    }),
  ).mutation(async ({ ctx, input }) => {


    const user = await prisma.user.findFirst({
      select: { ...defaultUserSelect, email: true, code: true },
      where: {
        OR: [{ email: input.email }, { username: input.username, }]
      }
    });

    if (user) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `ACCOUNT_EXISTS`,
      });
    }

    const code = generateOtp();
    const newUser = await prisma.user.create({
      select: {
        ...defaultUserSelect, email: true
      },
      data: {
        username: input.username,
        email: input.email,
        password: hashPassword(input.password),
        code: code,
        codeGeneratedAt: new Date(),
        confirmed: false,
        role: "Teacher"
      }
    })

    await sendConfirmationCode({ username: newUser.username, email: input.email, code: code });

    return newUser

  }),
  registerAsStudent: publicProcedure.input(
    z.object({
      username: z.string(),
      shareCode: z.string(),
      password: z.string().min(8)
    }),
  ).mutation(async ({ ctx, input }) => {


    const project = await prisma.project.findUnique({
      where: { shareCode: input.shareCode }

    });

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `CODE_NOT_FOUND`,
      });
    }


    const user = await prisma.user.findFirst({
      select: defaultUserSelect,
      where: {
        username: input.username
      }
    });

    if (user) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `ACCOUNT_EXISTS`,
      });
    }


    const newUser = await prisma.user.create({
      select: {
        ...defaultUserSelect
      },
      data: {
        username: input.username,
        password: hashPassword(input.password),
        confirmed: true,
        role: "Student"
      }
    })

    await prisma.project.update({
      where: { id: project.id },
      data: {
        members: {
          create: [{
            userId: newUser.id,
          }],
        }
      }
    })

    await new Promise((resolve) => ctx.req.login(newUser, () => resolve(null)));

    return { projectId: project.id }

  }),
  join: protectedProcedure.input(
    z.object({
      shareCode: z.string(),
    }),
  ).mutation(async ({ ctx, input }) => {

    const project = await prisma.project.findUnique({
      where: { shareCode: input.shareCode }

    });

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `CODE_NOT_FOUND`,
      });
    }

    await prisma.project.update({
      where: { id: project.id },
      data: {
        members: {
          create: [{
            userId: ctx.user?.id
          }],
        }
      }
    })
    return { projectId: project.id }
  }),

  askEmailConfirm: publicProcedure.input(
    z.object({
      email: z.string()
    }),
  ).mutation(async ({ ctx, input }) => {
    const user = await prisma.user.findFirst({
      select: { ...defaultUserSelect, email: true },
      where: {
        OR: [{ email: input.email }, { username: input.email, }]
      }
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Email or username not found`,
      });
    }
    if (!user.email) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `User account doesn't have email address`,
      });
    }

    const otp = generateOtp();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        code: otp,
        codeGeneratedAt: new Date()
      }
    })
    await sendConfirmationCode({ email: user.email, username: user.username, code: otp })
    return { status: true }
  }),

  confirm: publicProcedure.input(
    z.object({
      username: z.string(),
      code: z.string(),
    }),
  ).mutation(async ({ ctx, input }) => {
    const user = await prisma.user.findFirst({
      select: { ...defaultUserSelect, email: true, code: true },
      where: {
        OR: [{ email: input.username }, { username: input.username, }]
      }
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Email or username not found`,
      });
    }

    if (!compareCodes(input.code, user.code || "")) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Failed to confirm account, code invalid`
      });
    }

    const newUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        code: null,
        codeGeneratedAt: null,
        confirmed: true
      }
    })
    await new Promise((resolve) => ctx.req.login(newUser, () => resolve(null)));
    return { status: true }
  }),

  list: protectedProcedure.query(async () => {
    // Retrieve users from a datasource, this is an imaginary database
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['Student', 'Teacher'] }
      },
    });
    return users;
  }),
  me: protectedProcedure.query(async (opts) => {
    const { ctx } = opts;
    if (ctx.user) {
      // Retrieve the user with the given ID
      const user = await prisma.user.findUnique({
        select: { ...defaultUserSelect, email: true },
        where: { id: ctx.user.id }
      });
      return user;
    }
    return null;
  }),
  byId: protectedProcedure.input(
    z.object({
      id: z.string().uuid(),
    }),
  ).query(async (opts) => {
    const { input } = opts;
    // Retrieve the user with the given ID
    const user = await prisma.user.findUnique({ select: defaultUserSelect, where: { id: input.id } });
    return user;
  }),
  projects: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish()
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor, } = input;

      const items = await prisma.project.findMany({
        // select: defaultPostSelect,
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        where: {
          OR: [
            { userId: ctx.user ? ctx.user.id : undefined },
            ctx.user ? {
              members: {
                some: {
                  userId: ctx.user.id
                }
              }
            } : {}
          ]
        },
        include: {
          user: {
            select: defaultUserSelect
          },
          members: true,
          playlist: {
            include: {
              _count: true
            }
          },
          _count: true
        },
        cursor: cursor
          ? {
            id: cursor,
          }
          : undefined,
        orderBy: {
          publishedAt: 'desc',
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        // Remove the last item and use it as next cursor

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nextItem = items.pop()!;
        nextCursor = nextItem.id;
      }

      return {
        items: items.reverse(),
        nextCursor,
      };
    }),
  logout: protectedProcedure
    .mutation(async (opts) => {
      const { ctx } = opts;
      return ctx.logout();
    }),
});

