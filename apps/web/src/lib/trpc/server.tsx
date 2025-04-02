import "server-only"; // <-- ensure this file cannot be imported from the client
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { makeQueryClient } from "./query-client";
import {
  createTRPCContext,
  createCallerFactory,
  appRouter,
} from "@celluloid/trpc";
import { auth } from "@celluloid/auth";
import { headers } from "next/headers";

// async function createContext() {
//   const reqHeaders = (await headers()) as Headers;
//   const session = await auth.api.getSession({
//     headers: reqHeaders,
//   });
//   return createTRPCContext({
//     session,
//   });
// }
// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.

const createContent = cache(async () => {
  const reqHeaders = (await headers()) as Headers;
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });
  return createTRPCContext({ session });
});

export const getQueryClient = cache(makeQueryClient);
const caller = createCallerFactory(appRouter)(createContent);
export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient
);
