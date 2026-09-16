import { peertubeInstanceAuth } from "@celluloid/db";
import { refreshPeerTubeToken } from "@celluloid/peertube";
import { and, eq } from "drizzle-orm";
import type { db as DbClient } from "@celluloid/db";

export function normalizeHost(host: string): string {
  try {
    return new URL(host).origin;
  } catch {
    return host.replace(/\/$/, "");
  }
}

export async function resolveAccessToken(
  database: typeof DbClient,
  userId: string,
  host: string,
): Promise<string | null> {
  const normalized = normalizeHost(host);
  const [record] = await database
    .select()
    .from(peertubeInstanceAuth)
    .where(
      and(
        eq(peertubeInstanceAuth.userId, userId),
        eq(peertubeInstanceAuth.instanceHost, normalized),
      ),
    )
    .limit(1);

  if (!record?.accessToken) {
    return null;
  }

  const now = new Date();
  const expiresAt = record.accessTokenExpiresAt
    ? new Date(record.accessTokenExpiresAt)
    : null;
  const isExpired = expiresAt != null && expiresAt <= now;

  if (!isExpired) {
    return record.accessToken;
  }

  if (!record.refreshToken) {
    await database
      .update(peertubeInstanceAuth)
      .set({ status: "expired", updatedAt: now.toISOString() })
      .where(eq(peertubeInstanceAuth.id, record.id));
    return null;
  }

  try {
    const tokenResponse = await refreshPeerTubeToken(
      normalized,
      record.refreshToken,
    );
    const nextExpiresAt = new Date(
      now.getTime() + tokenResponse.expires_in * 1000,
    ).toISOString();

    await database
      .update(peertubeInstanceAuth)
      .set({
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        accessTokenExpiresAt: nextExpiresAt,
        status: "connected",
        lastError: null,
        updatedAt: now.toISOString(),
        lastUsedAt: now.toISOString(),
      })
      .where(eq(peertubeInstanceAuth.id, record.id));

    return tokenResponse.access_token;
  } catch {
    await database
      .update(peertubeInstanceAuth)
      .set({
        status: "expired",
        lastError: "token_refresh_failed",
        updatedAt: now.toISOString(),
      })
      .where(eq(peertubeInstanceAuth.id, record.id));
    return null;
  }
}
