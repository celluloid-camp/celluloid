"use client";
import { env } from "@/env";
import type { AppRouter } from "@celluloid/trpc";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { TRPCClientError, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import SuperJSON from "superjson";
import { makeQueryClient } from "./query-client";

export const trpc = createTRPCReact<AppRouter>();

let browserQueryClient: QueryClient;
function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return "";
    return env.BASE_URL;
  })();
  return `${base}/api/trpc`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: getUrl(),
          transformer: SuperJSON,
        }),
      ],
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

export function isTRPCClientError(
  cause: unknown,
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}
