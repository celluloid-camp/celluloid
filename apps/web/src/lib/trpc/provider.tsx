"use client";
import type { AppRouter } from "@celluloid/api";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import {
  createTRPCClient,
  httpBatchLink,
  loggerLink,
  TRPCClientError,
} from "@trpc/client";
import SuperJSON from "superjson";
import { env } from "@/env";
import { TRPCProvider as TRPCContextProvider } from "./client";
import { makeQueryClient } from "./query-client";

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render
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
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getUrl(),
      transformer: SuperJSON,
      // You can pass any HTTP headers you wish here
      async headers() {
        return {};
      },
    }),
  ],
});

const persister =
  typeof window !== "undefined"
    ? createAsyncStoragePersister({
        storage: window.localStorage,
      })
    : undefined;

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>
        <TRPCContextProvider trpcClient={trpcClient} queryClient={queryClient}>
          {children}
        </TRPCContextProvider>
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <TRPCContextProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCContextProvider>
    </PersistQueryClientProvider>
  );
}

export function isTRPCClientError(
  cause: unknown,
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}
