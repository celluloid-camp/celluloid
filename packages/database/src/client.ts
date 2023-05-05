import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

console.log("process.env.DATABASE_URL", process.env.DATABASE_URL)
export const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});


if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export * from "@prisma/client";
export type * from "@prisma/client/runtime";
