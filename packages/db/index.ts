import { PrismaPg } from "@prisma/adapter-pg";
import randomColor from "randomcolor";
import { PrismaClient } from "./generated/client";
import { keys } from "./keys";
import "./types";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// PrismaClient singleton pattern from Prisma docs
const prismaClientSingleton = () => {
  const env = keys();
  const pool = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({
    adapter: pool,
  }).$extends({
    result: {
      user: {
        initial: {
          needs: { username: true },
          compute(user) {
            return user.username
              .split(/\s+/)
              .map((part) => part.substring(0, 1))
              .join("")
              .substring(0, 2);
          },
        },
        color: {
          needs: { id: true },
          compute(user) {
            return randomColor({ seed: user.id, luminosity: "bright" });
          },
        },
      },
      storage: {
        publicUrl: {
          needs: { path: true, bucket: true },
          compute(storage) {
            return `${env.STORAGE_URL}/${storage.bucket}/${storage.path}`;
          },
        },
      },
    },
  });
};

export const db = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export * from "./generated/client";
