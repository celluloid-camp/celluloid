import { PrismaClient } from './generated/client/index.js'
import { Context } from "./index.d.js";

const prisma = new PrismaClient();

export const createContext = async (): Promise<Context> => ({ prisma });

export * from './generated/client/runtime/index.js'
