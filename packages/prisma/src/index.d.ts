import { PrismaClient } from './generated/client'

export * from "./generated/client/index.d";

import { PrismaClient } from './generated/client'

export interface Context {
  prisma: PrismaClient;
}

export function createContext(): Promise<Context>;
