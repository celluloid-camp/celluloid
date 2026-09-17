import {
  searchPeerTubePlaylists,
  searchPeerTubePrivateVideos,
  searchPeerTubeVideos,
} from "@celluloid/peertube";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { normalizeHost } from "../lib/peertube-instance";
import { resolveAccessToken } from "../lib/peertube-token";
import { publicProcedure, router } from "../trpc";

export const peertubeSearchRouter = router({
  searchVideos: publicProcedure
    .input(
      z
        .object({
          baseUrl: z.string().url(),
          search: z.string().default(""),
          start: z.number().int().min(0).optional().default(0),
          count: z.number().int().min(1).max(100).optional().default(15),
          mineOnly: z.boolean().optional().default(false),
        })
        .refine((v) => v.mineOnly || v.search.trim().length > 0, {
          message: "Search query is required",
          path: ["search"],
        }),
    )
    .query(async ({ ctx, input }) => {
      const host = normalizeHost(input.baseUrl);

      if (input.mineOnly) {
        if (!ctx.user?.id) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const accessToken = await resolveAccessToken(ctx.db, ctx.user.id, host);

        if (!accessToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message:
              "You must be connected to this PeerTube instance to search your own videos",
          });
        }

        const result = await searchPeerTubePrivateVideos(
          input.baseUrl,
          {
            search: input.search,
            start: input.start,
            count: input.count,
          },
          accessToken,
        );

        return mapSearchResults(input.baseUrl, result);
      }

      const accessToken = ctx.user?.id
        ? await resolveAccessToken(ctx.db, ctx.user.id, host)
        : null;

      const result = await searchPeerTubeVideos(
        input.baseUrl,
        {
          search: input.search,
          start: input.start,
          count: input.count,
        },
        accessToken ?? undefined,
      );

      return mapSearchResults(input.baseUrl, result);
    }),

  searchPlaylists: publicProcedure
    .input(
      z.object({
        baseUrl: z.string().url(),
        search: z.string().min(1),
        start: z.number().int().min(0).optional().default(0),
        count: z.number().int().min(1).max(100).optional().default(15),
      }),
    )
    .query(async ({ ctx, input }) => {
      const host = normalizeHost(input.baseUrl);
      const accessToken = ctx.user?.id
        ? await resolveAccessToken(ctx.db, ctx.user.id, host)
        : null;

      const result = await searchPeerTubePlaylists(
        input.baseUrl,
        {
          search: input.search,
          start: input.start,
          count: input.count,
        },
        accessToken ?? undefined,
      );

      const base = input.baseUrl.replace(/\/$/, "");
      return {
        total: result.total,
        data: result.data.map((p) => {
          const raw = p as {
            thumbnailUrl?: string;
            thumbnailPath?: string;
          };
          const thumbnailUrl =
            raw.thumbnailUrl ??
            (raw.thumbnailPath
              ? new URL(raw.thumbnailPath, base).toString()
              : undefined);

          return {
            id: p.id ?? 0,
            uuid: p.uuid,
            shortUUID: p.shortUUID,
            displayName: p.displayName,
            thumbnailUrl,
            videoLength: p.videoLength ?? 0,
            ownerName:
              p.ownerAccount?.displayName ?? p.ownerAccount?.name ?? null,
          };
        }),
      };
    }),
});

function mapSearchResults(
  baseUrl: string,
  result: {
    total: number;
    data: Array<{
      id?: number;
      uuid?: string;
      shortUUID?: string;
      name?: string;
      duration?: number;
      thumbnailUrl?: string;
      thumbnailPath?: string;
      thumbnails?: Array<{ fileUrl?: string }>;
      account?: {
        displayName?: string;
        name?: string;
      };
      channel?: {
        displayName?: string;
        name?: string;
      };
      publishedAt?: string;
      privacy?: {
        id?: number;
        label?: string;
      };
    }>;
  },
) {
  const base = baseUrl.replace(/\/$/, "");
  return {
    total: result.total,
    data: result.data.map((v) => {
      const raw = v as {
        thumbnailUrl?: string;
        thumbnailPath?: string;
        thumbnails?: Array<{ fileUrl?: string }>;
      };
      const thumbnailUrl =
        raw.thumbnailUrl ??
        (raw.thumbnails?.length ? raw.thumbnails[0]?.fileUrl : undefined) ??
        (raw.thumbnailPath
          ? new URL(raw.thumbnailPath, base).toString()
          : undefined);

      return {
        id: v.id ?? 0,
        uuid: v.uuid,
        shortUUID: v.shortUUID,
        name: v.name,
        duration: v.duration,
        thumbnailUrl,
        account: v.account,
        channel: v.channel,
        publishedAt: v.publishedAt,
        privacy: v.privacy
          ? {
              id: v.privacy.id ?? null,
              label: v.privacy.label ?? null,
            }
          : null,
      };
    }),
  };
}
