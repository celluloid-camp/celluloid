"use client";

import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { formatDuration } from "@/utils/duration";

export type SearchTarget = "videos" | "playlists";

export type SelectedSearchVideo = {
  id: number;
  name: string;
  thumbnailUrl?: string | null;
  url: string;
};

type ResultItem = {
  id: number;
  title: string;
  thumbnailUrl?: string | null;
  metaLine: string | null;
  chipLabel?: string | null;
  url: string;
};

type PeerTubeSearchResultsProps = {
  baseUrl: string;
  mineOnly?: boolean;
  onReset: () => void;
  onSelectVideo: (video: SelectedSearchVideo) => void;
  search: string;
  target?: SearchTarget;
};

export function PeerTubeSearchResults({
  baseUrl,
  mineOnly = false,
  search,
  onSelectVideo,
  onReset,
  target = "videos",
}: PeerTubeSearchResultsProps) {
  const api = useTRPC();
  const t = useTranslations("project.create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const isPlaylists = target === "playlists";
  const base = baseUrl.replace(/\/$/, "");

  const videosQuery = useQuery({
    ...api.peertubeSearch.searchVideos.queryOptions({
      baseUrl,
      search,
      mineOnly,
    }),
    enabled: !isPlaylists,
  });

  const playlistsQuery = useQuery({
    ...api.peertubeSearch.searchPlaylists.queryOptions({
      baseUrl,
      search,
    }),
    enabled: isPlaylists,
  });

  const activeQuery = isPlaylists ? playlistsQuery : videosQuery;
  const { isLoading, isError, error } = activeQuery;

  let total = 0;
  let items: ResultItem[] = [];

  if (isPlaylists && playlistsQuery.data) {
    total = playlistsQuery.data.total;
    items = playlistsQuery.data.data.map((p) => {
      const id = p.shortUUID ?? p.uuid ?? "";
      return {
        id: p.id,
        title: p.displayName ?? "",
        thumbnailUrl: p.thumbnailUrl ?? null,
        metaLine: [
          p.ownerName,
          t("playlistVideoCount", { count: p.videoLength }),
        ]
          .filter(Boolean)
          .join(" · "),
        url: `${base}/w/p/${id}`,
      };
    });
  } else if (!isPlaylists && videosQuery.data) {
    total = videosQuery.data.total;
    items = videosQuery.data.data.map((v) => {
      const author =
        v.channel?.displayName ??
        v.channel?.name ??
        v.account?.displayName ??
        v.account?.name ??
        null;
      const privacyId = v.privacy?.id ?? null;
      const isNonPublic = privacyId !== null && privacyId !== 1;
      return {
        id: v.id,
        title: v.name ?? "",
        thumbnailUrl: v.thumbnailUrl ?? null,
        metaLine:
          [author, v.duration ? formatDuration(v.duration) : null]
            .filter(Boolean)
            .join(" · ") || null,
        chipLabel: isNonPublic ? (v.privacy?.label ?? null) : null,
        url: `${base}/w/${v.uuid}`,
      };
    });
  }

  const hasData = activeQuery.data != null;

  let description: string;
  if (isLoading) {
    description = t("searching");
  } else if (isError) {
    description = error?.message ?? t("searchFailed");
  } else if (hasData) {
    description = isPlaylists
      ? t("playlistsFound", { count: total })
      : t("videosFound", { count: total });
  } else {
    description = t("resultsPlaceholder");
  }

  const handleUseSelected = () => {
    if (selectedId == null) {
      return;
    }
    const item = items.find((i) => i.id === selectedId);
    if (!item) {
      return;
    }
    onSelectVideo({
      id: item.id,
      name: item.title,
      thumbnailUrl: item.thumbnailUrl ?? null,
      url: item.url,
    });
  };

  return (
    <Box className="flex h-full flex-col">
      <Stack
        direction="row"
        className="mb-4 items-start justify-between gap-3 border-b border-black/5 pb-4"
      >
        <Box className="min-w-0">
          <Typography variant="h6">{t("results")}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            className="block truncate"
          >
            {baseUrl}
          </Typography>
        </Box>
        <Button
          disabled={isLoading && !isError}
          onClick={onReset}
          size="small"
          startIcon={<RefreshIcon />}
          variant="outlined"
        >
          {t("reset")}
        </Button>
      </Stack>

      <Box className="min-h-0 flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <Box className="flex justify-center py-10">
            <CircularProgress size={28} />
          </Box>
        ) : null}

        {isError ? (
          <Typography color="error" variant="body2">
            {error instanceof Error ? error.message : t("searchFailed")}
          </Typography>
        ) : null}

        {hasData && items.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            {isPlaylists ? t("noPlaylistsFound") : t("noVideosFound")}
          </Typography>
        ) : null}

        {!isError && items.length > 0 ? (
          <Stack spacing={1}>
            {items.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`flex w-full gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-slate-50 ${
                    isSelected ? "border-primary bg-slate-50" : "border-black/5"
                  }`}
                >
                  <Box className="pt-1">
                    {isSelected ? (
                      <CheckBoxIcon color="primary" fontSize="small" />
                    ) : (
                      <CheckBoxOutlineBlankIcon
                        color="disabled"
                        fontSize="small"
                      />
                    )}
                  </Box>

                  <Box className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-md bg-slate-100">
                    {item.thumbnailUrl ? (
                      <Image
                        alt={item.title}
                        className="object-cover"
                        fill
                        src={item.thumbnailUrl}
                        unoptimized
                      />
                    ) : null}
                  </Box>

                  <Box className="min-w-0 flex-1">
                    <Stack direction="row" spacing={1} className="items-start">
                      <Typography
                        variant="body2"
                        className="line-clamp-2 flex-1 font-medium"
                      >
                        {item.title}
                      </Typography>
                      {item.chipLabel ? (
                        <Chip label={item.chipLabel} size="small" />
                      ) : null}
                    </Stack>
                    {item.metaLine ? (
                      <Typography variant="caption" color="text.secondary">
                        {item.metaLine}
                      </Typography>
                    ) : null}
                  </Box>
                </button>
              );
            })}
          </Stack>
        ) : null}
      </Box>

      {!isLoading && !isError && items.length > 0 ? (
        <Box className="mt-4 flex items-center justify-between gap-3 border-t border-black/5 pt-4">
          <Typography variant="body2" color="text.secondary">
            {selectedId != null
              ? isPlaylists
                ? t("playlistSelected")
                : t("videoSelected")
              : isPlaylists
                ? t("selectPlaylistHint")
                : t("selectVideoHint")}
          </Typography>
          <Button
            disabled={selectedId == null}
            onClick={handleUseSelected}
            variant="contained"
          >
            {isPlaylists ? t("useSelectedPlaylist") : t("useSelectedVideo")}
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
