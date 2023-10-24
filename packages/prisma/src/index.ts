import PrismaModule, { PrismaClient } from "@prisma/client";
import randomColor from "randomcolor";

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
  },
})


export const prisma = prismaClient;

export * from "@prisma/client";

export default PrismaModule;
