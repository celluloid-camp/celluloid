import type { BetterAuthPlugin, User } from "better-auth";
import { APIError } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { createAuthEndpoint, createAuthMiddleware } from "better-auth/plugins";
import { z } from "zod";

const ERROR_CODES = {
  INVALID_USERNAME_OR_PASSWORD: "invalid username or password",
  EMAIL_NOT_VERIFIED: "email not verified",
  UNEXPECTED_ERROR: "unexpected error",
  USERNAME_IS_ALREADY_TAKEN: "username is already taken. please try another.",
  FAILED_TO_CREATE_USER: "Failed to create user",
  COULD_NOT_CREATE_SESSION: "Could not create session",
  ANONYMOUS_USERS_CANNOT_SIGN_IN_AGAIN_ANONYMOUSLY:
    "Anonymous users cannot sign in again anonymously",
  PASSWORD_TOO_SHORT: "Password too short",
  PASSWORD_TOO_LONG: "Password too long",
};

export const signupAsStudent = () => {
  return {
    id: "signupAsStudent",
    endpoints: {
      signUpAsStudent: createAuthEndpoint(
        "/sign-up-as-student",
        {
          method: "POST",
          // use: [sessionMiddleware],
          body: z.object({
            username: z.string({
              description: "The username of the user",
            }),
            password: z.string({
              description: "The password of the user",
            }),
            rememberMe: z
              .boolean({
                description: "Remember the user session",
              })
              .optional(),
          }),
          metadata: {
            openapi: {
              description: "Sign up as student",
              responses: {
                200: {
                  description: "Sign up as student",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          user: {
                            $ref: "#/components/schemas/User",
                          },
                          session: {
                            $ref: "#/components/schemas/Session",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        async (ctx) => {
          const password = ctx.body.password;

          const minPasswordLength =
            ctx.context.password.config.minPasswordLength;
          if (password.length < minPasswordLength) {
            ctx.context.logger.error("Password is too short");
            throw new APIError("BAD_REQUEST", {
              message: ERROR_CODES.PASSWORD_TOO_SHORT,
            });
          }

          const maxPasswordLength =
            ctx.context.password.config.maxPasswordLength;
          if (password.length > maxPasswordLength) {
            ctx.context.logger.error("Password is too long");
            throw new APIError("BAD_REQUEST", {
              message: ERROR_CODES.PASSWORD_TOO_LONG,
            });
          }

          const id = ctx.context.generateId({ model: "user" });
          const email = `temp-${id}@celluloid.me`;
          const newUser = await ctx.context.internalAdapter.createUser({
            id,
            email,
            emailVerified: true,
            name: ctx.body.username,
            role: "student",
            username: ctx.body.username,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          if (!newUser) {
            return ctx.json(null, {
              status: 500,
              body: {
                message: ERROR_CODES.FAILED_TO_CREATE_USER,
                status: "error",
              },
            });
          }
          const hash = await ctx.context.password.hash(password);
          await ctx.context.internalAdapter.linkAccount({
            userId: newUser.id,
            providerId: "credential",
            accountId: newUser.id,
            password: hash,
          });
          const session = await ctx.context.internalAdapter.createSession(
            newUser.id,
            ctx.request,
          );

          if (!session) {
            return ctx.json(null, {
              status: 400,
              body: {
                message: ERROR_CODES.COULD_NOT_CREATE_SESSION,
              },
            });
          }
          await setSessionCookie(ctx, {
            session,
            user: newUser,
          });
          return ctx.json({
            user: {
              id: newUser.id,
              email: newUser.email,
              emailVerified: newUser.emailVerified,
              name: newUser.name,
              createdAt: newUser.createdAt,
              updatedAt: newUser.updatedAt,
            },
            session,
          });
        },
      ),
    },
    hooks: {
      before: [
        {
          matcher: (context) => context.path === "/sign-up-as-student",
          handler: createAuthMiddleware(async (ctx) => {
            const username = ctx.body.username;
            if (username) {
              const user = await ctx.context.adapter.findOne<User>({
                model: "user",
                where: [
                  {
                    field: "username",
                    value: username.toLowerCase(),
                  },
                ],
              });
              if (user) {
                throw new APIError("UNPROCESSABLE_ENTITY", {
                  message: ERROR_CODES.USERNAME_IS_ALREADY_TAKEN,
                });
              }
            }
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin;
};
