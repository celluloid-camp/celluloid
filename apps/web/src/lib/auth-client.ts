import { createAuthClient } from "better-auth/react";
import {
	adminClient,
	emailOTPClient,
	inferAdditionalFields,
	usernameClient,
} from "better-auth/client/plugins";
import type { auth } from "@celluloid/auth";
import { signupAsStudentClient } from "@celluloid/auth/client/plugins";

export const authClient = createAuthClient({
	plugins: [
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
