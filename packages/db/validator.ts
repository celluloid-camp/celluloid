import { Prisma } from "./generated/client";

export const defaultUserSelect = {
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
} satisfies Prisma.UserSelect;

export type UserPayload = Prisma.UserGetPayload<{
  select: typeof defaultUserSelect;
}>;
