import PrismaModule, { type Prisma, PrismaClient } from "@prisma/client";
import randomColor from "randomcolor";
import { env } from "./env";

// PrismaClient singleton pattern from Prisma docs
const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
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
      annotation: {
        extra: {
          needs: { extra: true },
          compute(a) {
            if (
              a.extra &&
              typeof a.extra === "object" &&
              "x" in a.extra
            ) {
              const extraObject = a.extra as Prisma.JsonObject;
              return {
                x: extraObject.x,
                y: extraObject.y,
                relativeX: extraObject.relativeX,
                relativeY: extraObject.relativeY,
                parentWidth: extraObject.parentWidth,
                parentHeight: extraObject.parentHeight,
              };
            }
            return null;
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

export default PrismaModule;
