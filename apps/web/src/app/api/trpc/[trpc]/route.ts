import { appRouter, createTRPCContext } from "@celluloid/api";
import { auth } from "@celluloid/auth";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { headers } from "next/headers";

const handler = async (req: Request) => {
  const reqHeaders = (await headers()) as Headers;
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError:
      process.env.NODE_ENV === "development"
        ? (p) => {
            console.error(
              `❌ tRPC failed on ${p.path ?? "<no-path>"}: ${p.error.message}`,
            );
          }
        : undefined,
  });
};

export { handler as GET, handler as POST };
