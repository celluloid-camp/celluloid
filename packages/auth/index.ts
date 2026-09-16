import { betterAuth } from "better-auth";
import { createAuthOptions } from "./config";

export const auth = betterAuth(createAuthOptions());

export type Session = typeof auth.$Infer.Session;
