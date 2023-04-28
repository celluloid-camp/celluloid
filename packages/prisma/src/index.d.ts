import { PrismaClient } from './generated'
export type * from "./generated/index.d";

export interface Context {
  prisma: PrismaClient;
}

export function createContext(): Promise<Context>;
