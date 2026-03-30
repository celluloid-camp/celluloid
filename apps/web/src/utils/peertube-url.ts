/**
 * Build a PeerTube watch URL (`/w/:videoId`).
 * `host` may be stored as `example.com` or `https://example.com` (with or without trailing slash).
 */
export function peerTubeWatchUrl(
  host: string | null | undefined,
  videoId: string,
): string {
  const h = host?.trim() ?? "";
  if (!h || !videoId) {
    return "";
  }
  const base = /^https?:\/\//i.test(h)
    ? h.replace(/\/$/, "")
    : `https://${h.replace(/\/$/, "")}`;
  return `${base}/w/${videoId}`;
}
