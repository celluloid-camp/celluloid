import PrismaModule, { type Prisma, PrismaClient } from "@prisma/client";
import randomColor from "randomcolor";
import { env } from "./env";

const prismaClient = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
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
            }
          }
          return null
        },
      }
    },
    project: {
      dublin: {
        needs: { dublin: true },
        compute(a) {
          if (a.dublin && typeof a.dublin === 'object' &&
            !Array.isArray(a.dublin)) {

            const dublinObject = a.dublin as Prisma.JsonObject
            return {
              title: dublinObject.title as string,
              creator: dublinObject.creator as string,
              subject: dublinObject.subject as string,
              description: dublinObject.description as string,
              publisher: dublinObject.publisher as string,
              contributor: dublinObject.contributor as string,
              date: dublinObject.date as string,
              type: dublinObject.type as string,
              format: dublinObject.format as string,
              identifier: dublinObject.identifier as string,
              source: dublinObject.source as string,
              language: dublinObject.language as string,
              relation: dublinObject.relation as string,
              coverage: dublinObject.coverage as string,
              rights: dublinObject.rights as string,
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

