import { appRouter, createTRPCContext } from "@celluloid/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = async (req: Request) => {
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
