import { PrismaClient } from './generated/client'

// export * from "./generated/client/index.d";

export type * from "./generated/client/runtime/index.d";

export interface Context {
  prisma: PrismaClient;
}

export function createContext(): Promise<Context>;
