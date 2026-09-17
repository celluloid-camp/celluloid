import {
  getApiV1UsersMeVideos,
  searchPlaylists,
  searchVideos,
} from "@celluloid/peertube-api";
import { createClient } from "@celluloid/peertube-api/client";

const DEFAULT_COUNT = 15;
const DEFAULT_SORT = "-match";

export interface PeerTubeSearchVideosParams {
  count?: number;
  search: string;
  sort?: NonNullable<
    NonNullable<Parameters<typeof searchVideos>[0]>["query"]
  >["sort"];
  start?: number;
}

export interface PeerTubeSearchPrivateVideosParams {
  count?: number;
  search?: string;
  sort?: NonNullable<
    NonNullable<Parameters<typeof getApiV1UsersMeVideos>[0]>["query"]
  >["sort"];
  start?: number;
}

export async function searchPeerTubeVideos(
  baseUrl: string,
  params: PeerTubeSearchVideosParams,
  accessToken?: string,
) {
  const {
    search,
    start = 0,
    count = DEFAULT_COUNT,
    sort = DEFAULT_SORT,
  } = params;

  const client = createClient({
    baseUrl: baseUrl.replace(/\/$/, ""),
    ...(accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : {}),
  });

  const { data, error } = await searchVideos({
    client,
    query: {
      search: search.trim(),
      start,
      count: Math.min(100, Math.max(1, count)),
      sort: sort as Parameters<typeof searchVideos>[0]["query"]["sort"],
    },
  });

  if (error) {
    throw new Error(`PeerTube search failed: ${String(error)}`);
  }
  if (typeof data?.total !== "number" || !Array.isArray(data?.data)) {
    throw new Error("Invalid PeerTube search response");
  }

  return {
    total: data.total ?? 0,
    data: data.data ?? [],
  };
}

export interface PeerTubeSearchPlaylistsParams {
  count?: number;
  search: string;
  sort?: string;
  start?: number;
}

export async function searchPeerTubePlaylists(
  baseUrl: string,
  params: PeerTubeSearchPlaylistsParams,
  accessToken?: string,
) {
  const { search, start = 0, count = DEFAULT_COUNT, sort } = params;

  const client = createClient({
    baseUrl: baseUrl.replace(/\/$/, ""),
    ...(accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : {}),
  });

  const { data, error } = await searchPlaylists({
    client,
    query: {
      search: search.trim(),
      start,
      count: Math.min(100, Math.max(1, count)),
      ...(sort ? { sort } : {}),
    },
  });

  if (error) {
    throw new Error(`PeerTube playlist search failed: ${String(error)}`);
  }

  return {
    total: data?.total ?? 0,
    data: data?.data ?? [],
  };
}

const DEFAULT_PRIVATE_SORT: PeerTubeSearchPrivateVideosParams["sort"] =
  "-publishedAt";

export async function searchPeerTubePrivateVideos(
  baseUrl: string,
  params: PeerTubeSearchPrivateVideosParams,
  accessToken: string,
) {
  const {
    search,
    start = 0,
    count = DEFAULT_COUNT,
    sort = DEFAULT_PRIVATE_SORT,
  } = params;

  const client = createClient({
    baseUrl: baseUrl.replace(/\/$/, ""),
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const trimmedSearch = search?.trim();

  const { data, error } = await getApiV1UsersMeVideos({
    client,
    query: {
      start,
      count: Math.min(100, Math.max(1, count)),
      sort,
      ...(trimmedSearch ? { search: trimmedSearch } : {}),
    },
  });

  if (error) {
    throw new Error(`PeerTube private search failed: ${String(error)}`);
  }
  if (typeof data?.total !== "number" || !Array.isArray(data?.data)) {
    throw new Error("Invalid PeerTube private search response");
  }

  return {
    total: data.total ?? 0,
    data: data.data ?? [],
  };
}
