import { peertubeInstance, peertubeInstanceAuth } from "@celluloid/db";
import { authenticatePeerTube } from "@celluloid/peertube";
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import { fetchInstanceMetadata, normalizeHost } from "../lib/peertube-instance";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const peertubeInstanceRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(50).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const userId = ctx.user?.id;

      const instances = await ctx.db
        .select({
          id: peertubeInstance.id,
          host: peertubeInstance.host,
          title: peertubeInstance.title,
          description: peertubeInstance.description,
          thumbnail: peertubeInstance.thumbnail,
          isIndex: peertubeInstance.isIndex,
        })
        .from(peertubeInstance)
        .where(
          userId
            ? or(
                eq(peertubeInstance.isPublic, true),
                eq(peertubeInstance.userId, userId),
              )
            : eq(peertubeInstance.isPublic, true),
        )
        .limit(limit);

      return instances;
    }),

  listWithAuth: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(50).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const limit = input?.limit ?? 10;

      const instances = await ctx.db
        .select({
          id: peertubeInstance.id,
          host: peertubeInstance.host,
          title: peertubeInstance.title,
          description: peertubeInstance.description,
          thumbnail: peertubeInstance.thumbnail,
          isIndex: peertubeInstance.isIndex,
        })
        .from(peertubeInstance)
        .where(
          or(
            eq(peertubeInstance.isPublic, true),
            eq(peertubeInstance.userId, userId),
          ),
        )
        .limit(limit);

      const authRows = await ctx.db
        .select({
          instanceHost: peertubeInstanceAuth.instanceHost,
          status: peertubeInstanceAuth.status,
        })
        .from(peertubeInstanceAuth)
        .where(eq(peertubeInstanceAuth.userId, userId));

      const authByHost = new Map(authRows.map((r) => [r.instanceHost, r]));

      return instances.map((inst) => {
        const authRecord = authByHost.get(normalizeHost(inst.host));
        return {
          ...inst,
          authStatus: authRecord?.status ?? null,
          isConnected: authRecord?.status === "connected",
        };
      });
    }),

  addOwn: protectedProcedure
    .input(
      z.object({
        description: z.string().trim().max(500).optional(),
        host: z.string().url(),
        thumbnail: z.string().url().optional(),
        title: z.string().trim().min(1).max(120).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const host = normalizeHost(input.host);
      const hostUrl = new URL(host);
      const instanceMetadata = await fetchInstanceMetadata(host);

      const [existing] = await ctx.db
        .select({ id: peertubeInstance.id })
        .from(peertubeInstance)
        .where(
          and(
            eq(peertubeInstance.userId, userId),
            eq(peertubeInstance.host, host),
          ),
        )
        .limit(1);

      if (existing) {
        throw new Error("instance_already_exists");
      }

      const [instance] = await ctx.db
        .insert(peertubeInstance)
        .values({
          description: input.description,
          host,
          isIndex: false,
          isPublic: false,
          thumbnail:
            input.thumbnail ??
            instanceMetadata.thumbnail ??
            `${host}/favicon.ico`,
          title: input.title ?? instanceMetadata.title ?? hostUrl.hostname,
          userId,
        })
        .returning({
          description: peertubeInstance.description,
          host: peertubeInstance.host,
          id: peertubeInstance.id,
          isIndex: peertubeInstance.isIndex,
          thumbnail: peertubeInstance.thumbnail,
          title: peertubeInstance.title,
        });

      return instance;
    }),

  authStatus: protectedProcedure
    .input(z.object({ host: z.string().url() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const host = normalizeHost(input.host);

      const [record] = await ctx.db
        .select({
          status: peertubeInstanceAuth.status,
          accessTokenExpiresAt: peertubeInstanceAuth.accessTokenExpiresAt,
          lastError: peertubeInstanceAuth.lastError,
          updatedAt: peertubeInstanceAuth.updatedAt,
        })
        .from(peertubeInstanceAuth)
        .where(
          and(
            eq(peertubeInstanceAuth.userId, userId),
            eq(peertubeInstanceAuth.instanceHost, host),
          ),
        )
        .limit(1);

      if (!record) {
        return {
          status: null,
          expiresAt: null,
          lastError: null,
          updatedAt: null,
        };
      }

      return {
        status: record.status,
        updatedAt: record.updatedAt,
        expiresAt: record.accessTokenExpiresAt,
        lastError: record.lastError,
      };
    }),

  connect: protectedProcedure
    .input(
      z.object({
        host: z.string().url(),
        email: z.string().min(1),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const host = normalizeHost(input.host);

      const [instance] = await ctx.db
        .select({ isIndex: peertubeInstance.isIndex })
        .from(peertubeInstance)
        .where(eq(peertubeInstance.host, host))
        .limit(1);

      if (instance?.isIndex) {
        throw new Error("instance_auth_not_allowed");
      }

      let tokenResponse: Awaited<ReturnType<typeof authenticatePeerTube>>;
      try {
        tokenResponse = await authenticatePeerTube(
          host,
          input.email,
          input.password,
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Authentication failed";
        const isInvalidCredentials = message === "invalid_credentials";

        await ctx.db
          .insert(peertubeInstanceAuth)
          .values({
            userId,
            instanceHost: host,
            usernameOrEmail: input.email,
            status: "failed",
            lastError: isInvalidCredentials
              ? "invalid_credentials"
              : "connection_failed",
          })
          .onConflictDoUpdate({
            target: [
              peertubeInstanceAuth.userId,
              peertubeInstanceAuth.instanceHost,
            ],
            set: {
              status: "failed",
              lastError: isInvalidCredentials
                ? "invalid_credentials"
                : "connection_failed",
              updatedAt: new Date().toISOString(),
            },
          });

        throw new Error(
          isInvalidCredentials ? "invalid_credentials" : "connection_failed",
        );
      }

      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + tokenResponse.expires_in * 1000,
      ).toISOString();

      await ctx.db
        .insert(peertubeInstanceAuth)
        .values({
          userId,
          instanceHost: host,
          usernameOrEmail: input.email,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          accessTokenExpiresAt: expiresAt,
          status: "connected",
          lastError: null,
          updatedAt: now.toISOString(),
          lastUsedAt: now.toISOString(),
        })
        .onConflictDoUpdate({
          target: [
            peertubeInstanceAuth.userId,
            peertubeInstanceAuth.instanceHost,
          ],
          set: {
            usernameOrEmail: input.email,
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            accessTokenExpiresAt: expiresAt,
            status: "connected",
            lastError: null,
            updatedAt: now.toISOString(),
            lastUsedAt: now.toISOString(),
          },
        });

      return {
        success: true,
        status: "connected" as const,
        expiresAt,
      };
    }),

  disconnect: protectedProcedure
    .input(z.object({ host: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const host = normalizeHost(input.host);

      await ctx.db
        .delete(peertubeInstanceAuth)
        .where(
          and(
            eq(peertubeInstanceAuth.userId, userId),
            eq(peertubeInstanceAuth.instanceHost, host),
          ),
        );

      return { success: true };
    }),
});
