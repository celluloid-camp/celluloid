import { betterAuth } from "better-auth";
import { authOptions } from "./config";

export const auth = betterAuth(authOptions);

export type Session = typeof auth.$Infer.Session;
