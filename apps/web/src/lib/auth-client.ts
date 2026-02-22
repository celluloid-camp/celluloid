import type { auth } from "@celluloid/auth";
import { signupAsStudentClient } from "@celluloid/auth/plugins/client";
import {
  adminClient,
  emailOTPClient,
  genericOAuthClient,
  inferAdditionalFields,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    genericOAuthClient(),
    adminClient(),
    signupAsStudentClient(),
    usernameClient(),
    emailOTPClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;

export const { signIn, signUp, signOut, useSession, changePassword } =
  authClient;
