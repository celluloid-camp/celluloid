import "./types";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, User } from '@prisma/client';
import { keys } from "./keys";
import { generateColorFromSeed } from "./utils";

// PrismaClient singleton pattern from Prisma docs
const prismaClientSingleton = () => {
  const pool = new PrismaPg({ connectionString: keys().DATABASE_URL });
  return new PrismaClient({ adapter: pool }).$extends({
    result: {
      user: {
        initial: {
          needs: { username: true },
          compute(user: User) {
            return user.username
              .split(/\s+/)
              .map((part: string) => part.substring(0, 1))
              .join("")
              .substring(0, 2);
          },
        },
        color: {
          needs: { id: true },
          compute(user: User) {
            return generateColorFromSeed(user.id);
          },
        },
      },
      storage: {
        publicUrl: {
          needs: { path: true, bucket: true },
          compute(storage: Storage) {
            return `${keys().STORAGE_URL}/${storage.bucket}/${storage.path}`;
          },
        },
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };

export * from "@prisma/client";

export type AnnotationShape = PrismaJson.AnnotationShape;
