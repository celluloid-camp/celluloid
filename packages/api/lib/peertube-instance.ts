import { getConfig } from "@celluloid/peertube-api";
import { createClient } from "@celluloid/peertube-api/client";
import { normalizeHost } from "./peertube-token";

export async function fetchInstanceMetadata(host: string) {
  try {
    const client = createClient({ baseUrl: host.replace(/\/$/, "") });
    const { data, error } = await getConfig({ client });
    if (error || !data) {
      return { thumbnail: null, title: null };
    }

    const instanceWithLogo = data.instance as
      | (NonNullable<typeof data.instance> & {
          logo?: Array<{ fileUrl?: string; path?: string }>;
        })
      | undefined;
    const rawTitle = data.instance?.name?.trim() ?? "";
    const rawImage =
      instanceWithLogo?.logo?.[0]?.fileUrl ??
      instanceWithLogo?.logo?.[0]?.path ??
      data.instance?.avatars?.[0]?.fileUrl ??
      data.instance?.avatars?.[0]?.path ??
      "";

    const title = rawTitle.length > 0 ? rawTitle : null;
    const thumbnail = rawImage ? new URL(rawImage, host).toString() : null;

    return { thumbnail, title };
  } catch {
    return { thumbnail: null, title: null };
  }
}

export { normalizeHost };
