import type { BetterAuthClientPlugin } from "better-auth";
import type { signupAsStudent } from ".";

export const signupAsStudentClient = () => {
  return {
    id: "signupAsStudent",
    $InferServerPlugin: {} as ReturnType<typeof signupAsStudent>,
    pathMethods: {
      "/sign-up-as-student": "POST",
    },
  } satisfies BetterAuthClientPlugin;
};
