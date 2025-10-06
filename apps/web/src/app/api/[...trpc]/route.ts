import { auth } from "@celluloid/auth";
import { appRouter, createTRPCContext } from "@celluloid/trpc";
import { headers } from "next/headers";
import { createOpenApiFetchHandler } from "trpc-to-openapi";

export const dynamic = "force-dynamic";

const handler = async (req: Request) => {
  const reqHeaders = (await headers()) as Headers;
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  return createOpenApiFetchHandler({
    endpoint: "/api",
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        session,
      }),
    req,
  });
};

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
};
