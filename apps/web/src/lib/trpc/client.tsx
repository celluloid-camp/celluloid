/**
 * tRPC Client Configuration
 * Client-side utilities for making type-safe API calls
 */

import type { AppRouter } from "@celluloid/api";
import { createTRPCContext } from "@trpc/tanstack-react-query";

/**
 * A set of strongly-typed React hooks from your `AppRouter` type signature.
 * Using @trpc/tanstack-react-query for optimal integration
 */
export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
