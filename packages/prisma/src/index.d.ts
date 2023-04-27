import { PrismaClient } from "@prisma/client";

export * from ".prisma/client/index.d";

import { PrismaClient } from './generated/client'

export interface Context {
  prisma: PrismaClient;
}

export function createContext(): Promise<Context>;
