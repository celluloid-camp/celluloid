import PrismaModule, { type Prisma, PrismaClient } from "@prisma/client";
import randomColor from "randomcolor";
// import { env } from '@celluloid/utils';

const prismaClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
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
            .substring(0, 2)
        },
      },
      color: {
        needs: { id: true },
        compute(user) {
          return randomColor({ seed: user.id, luminosity: "bright" })
        },
      },
    },
    storage: {
      publicUrl: {
        needs: { path: true, bucket: true },
        compute(storage) {
          return `${process.env.STORAGE_URL}/${storage.bucket}/${storage.path}`
        },
      }
    },
    annotation: {
      extra: {
        needs: { extra: true },
        compute(a) {
          if (a.extra && typeof a.extra === 'object' &&
            !Array.isArray(a.extra)) {

            const extraObject = a.extra as Prisma.JsonObject
            return {
              x: extraObject.x,
              y: extraObject.y,
              relativeX: extraObject.relativeX,
              relativeY: extraObject.relativeY,
              parentWidth: extraObject.parentWidth,
              parentHeight: extraObject.parentHeight,
              emotion: extraObject.emotion,
            }
          }
          return null
        },
      }
    }
  },
})

export const prisma = prismaClient;

export * from "@prisma/client";

export default PrismaModule;

