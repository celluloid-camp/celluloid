"use client";

import type { AppRouter } from "@celluloid/api";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OndemandVideoOutlinedIcon from "@mui/icons-material/OndemandVideoOutlined";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import { AddInstanceDialog } from "./add-instance-dialog";
import {
  ConnectInstanceDialog,
  ConnectionStatusBadge,
} from "./connect-instance-dialog";
import {
  PeerTubeSearchResults,
  type SearchTarget,
  type SelectedSearchVideo,
} from "./peertube-search-results";

type RouterOutput = inferRouterOutputs<AppRouter>;
type PeerTubeInstance =
  RouterOutput["peertubeInstance"]["listWithAuth"][number];

export function CreateSearchPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const api = useTRPC();
  const t = useTranslations("project.create");
  const { data: session } = useSession();

  const publicInstancesQuery = useQuery({
    ...api.peertubeInstance.list.queryOptions({ limit: 20 }),
    enabled: !session?.user,
  });

  const authInstancesQuery = useQuery({
    ...api.peertubeInstance.listWithAuth.queryOptions({ limit: 20 }),
    enabled: Boolean(session?.user),
  });

  const instancesQuery = session?.user
    ? authInstancesQuery
    : publicInstancesQuery;

  const instances = (instancesQuery.data ?? []) as Array<
    PeerTubeInstance & { authStatus?: string | null; isConnected?: boolean }
  >;

  const [selectedInstance, setSelectedInstance] =
    useState<PeerTubeInstance | null>(null);
  const [instanceMenuAnchor, setInstanceMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [addInstanceOpen, setAddInstanceOpen] = useState(false);

  const activeInstance = selectedInstance ?? instances[0] ?? null;
  const isLoginDisabled = activeInstance?.isIndex ?? false;
  const isInstanceConnected = activeInstance?.isConnected ?? false;

  const initialQ = searchParams.get("q")?.trim() ?? "";
  const [query, setQuery] = useState(initialQ);
  const [submittedSearch, setSubmittedSearch] = useState<string | null>(
    initialQ.length > 0 ? initialQ : null,
  );
  const [mineOnly, setMineOnly] = useState(false);
  const [submittedMineOnly, setSubmittedMineOnly] = useState(false);
  const [target, setTarget] = useState<SearchTarget>("videos");
  const [submittedTarget, setSubmittedTarget] =
    useState<SearchTarget>("videos");
  const isPlaylists = target === "playlists";

  const handleInstanceSelect = (instance: PeerTubeInstance) => {
    setSelectedInstance(instance);
    setQuery("");
    setSubmittedSearch(null);
    setMineOnly(false);
    setSubmittedMineOnly(false);
    setInstanceMenuAnchor(null);
    router.replace("/create/search");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    const onlyMine = mineOnly && isInstanceConnected && !isPlaylists;
    if (!(q || onlyMine)) {
      return;
    }
    setSubmittedSearch(q);
    setSubmittedMineOnly(onlyMine);
    setSubmittedTarget(target);
    router.replace(
      q.length > 0
        ? `/create/search?q=${encodeURIComponent(q)}`
        : "/create/search",
    );
  };

  const handleResetSearch = () => {
    setQuery("");
    setSubmittedSearch(null);
    setMineOnly(false);
    setSubmittedMineOnly(false);
    setSelectedInstance(null);
    router.replace("/create/search");
  };

  const handleSelectVideo = (video: SelectedSearchVideo) => {
    router.push(`/create/link?url=${encodeURIComponent(video.url)}`);
  };

  const hasResults = submittedSearch !== null;

  return (
    <Box
      className={
        hasResults
          ? "flex h-full w-full flex-col gap-6 lg:flex-row"
          : "h-full w-full"
      }
    >
      <Box className={hasResults ? "w-full lg:w-2/5" : "w-full"}>
        <Typography variant="h6" gutterBottom>
          {t("peerTubeInstancesTitle")}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mb-4">
          {t("searchImportDescription")}
        </Typography>

        <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
          <Box>
            <Typography variant="subtitle2" className="mb-1.5">
              {t("instance")}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                onClick={(event) => setInstanceMenuAnchor(event.currentTarget)}
                endIcon={<ExpandMoreIcon />}
                variant="outlined"
                className="h-14 justify-between normal-case"
              >
                {activeInstance ? (
                  <Stack
                    direction="row"
                    spacing={1.5}
                    className="min-w-0 items-center"
                  >
                    {activeInstance.thumbnail ? (
                      <Box className="relative h-8 w-8 shrink-0 overflow-hidden rounded-sm bg-white">
                        <Image
                          alt={activeInstance.title}
                          className="object-cover"
                          fill
                          src={activeInstance.thumbnail}
                          unoptimized
                        />
                      </Box>
                    ) : null}
                    <Box className="min-w-0 text-left">
                      <Typography variant="body2" className="truncate">
                        {activeInstance.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        className="block truncate"
                      >
                        {activeInstance.host}
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t("noPublicInstances")}
                  </Typography>
                )}
              </Button>

              {session?.user ? (
                <Button
                  aria-label={t("addInstance")}
                  className="h-14 min-w-14 shrink-0 px-0"
                  onClick={() => setAddInstanceOpen(true)}
                  title={t("addInstance")}
                  variant="outlined"
                >
                  <AddIcon />
                </Button>
              ) : null}
            </Stack>

            <Menu
              anchorEl={instanceMenuAnchor}
              open={Boolean(instanceMenuAnchor)}
              onClose={() => setInstanceMenuAnchor(null)}
            >
              {instances.map((instance) => (
                <MenuItem
                  key={instance.id}
                  onClick={() => handleInstanceSelect(instance)}
                  className="min-w-[280px]"
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    className="w-full items-center"
                  >
                    {instance.thumbnail ? (
                      <Box className="relative h-8 w-8 shrink-0 overflow-hidden rounded-sm bg-slate-100">
                        <Image
                          alt={instance.title}
                          className="object-cover"
                          fill
                          src={instance.thumbnail}
                          unoptimized
                        />
                      </Box>
                    ) : null}
                    <Box className="min-w-0 flex-1">
                      <Typography variant="body2" className="truncate">
                        {instance.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        className="block truncate"
                      >
                        {instance.host}
                      </Typography>
                    </Box>
                    {"authStatus" in instance ? (
                      <ConnectionStatusBadge
                        status={instance.authStatus ?? null}
                      />
                    ) : null}
                  </Stack>
                </MenuItem>
              ))}
            </Menu>

            {activeInstance && !isLoginDisabled && session?.user ? (
              <Box className="mt-2">
                <ConnectInstanceDialog
                  host={activeInstance.host}
                  instanceTitle={activeInstance.title}
                  onStatusChange={() => {
                    void instancesQuery.refetch();
                  }}
                />
              </Box>
            ) : null}
          </Box>

          <Box
            aria-label={t("searchTargetLabel")}
            className="flex gap-1 rounded-full border border-black/6 bg-black/4 p-1"
            role="radiogroup"
          >
            {(
              [
                {
                  value: "videos",
                  label: t("searchTargetVideos"),
                  icon: OndemandVideoOutlinedIcon,
                },
                {
                  value: "playlists",
                  label: t("searchTargetPlaylists"),
                  icon: PlaylistPlayIcon,
                },
              ] as const
            ).map(({ value, label, icon: Icon }) => {
              const active = target === value;
              return (
                <button
                  aria-checked={active}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 font-medium text-sm transition-colors ${
                    active
                      ? "bg-white text-primary shadow-sm"
                      : "text-[#65748B] hover:text-[#121828]"
                  }`}
                  key={value}
                  onClick={() => setTarget(value)}
                  role="radio"
                  type="button"
                >
                  <Icon fontSize="small" />
                  {label}
                </button>
              );
            })}
          </Box>

          <TextField
            fullWidth
            id="search"
            label={
              isPlaylists ? t("searchPlaylistsLabel") : t("searchVideosLabel")
            }
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              isPlaylists
                ? t("searchPlaylistsPlaceholder")
                : t("searchVideosPlaceholder")
            }
            type="search"
            value={query}
          />

          {isInstanceConnected && !isPlaylists ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={mineOnly}
                  onChange={(event) => setMineOnly(event.target.checked)}
                />
              }
              label={t("searchMineOnly")}
            />
          ) : null}

          <Box className="flex justify-end">
            <Button
              disabled={
                !(
                  query.trim() ||
                  (mineOnly && isInstanceConnected && !isPlaylists)
                )
              }
              startIcon={<SearchIcon />}
              type="submit"
              variant="contained"
            >
              {isPlaylists
                ? t("searchPlaylistsSubmit")
                : t("searchVideosSubmit")}
            </Button>
          </Box>
        </Stack>

        {hasResults ? null : (
          <Box className="mt-6 rounded-2xl border border-black/6 bg-[#FBFBFD] p-6">
            <Typography variant="subtitle1" className="font-semibold">
              {t("searchGuideTitle")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              className="mt-1 mb-4"
            >
              {t("searchGuideDescription")}
            </Typography>
            <Stack spacing={2} component="ol">
              {[
                t("searchGuideStep1"),
                t("searchGuideStep2"),
                t("searchGuideStep3"),
              ].map((step, index) => (
                <Box
                  component="li"
                  className="flex items-start gap-3"
                  key={step}
                >
                  <Box className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-primary text-xs font-semibold">
                    {index + 1}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {step}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      {hasResults ? (
        <Box className="w-full lg:w-3/5">
          <PeerTubeSearchResults
            baseUrl={activeInstance?.host ?? ""}
            mineOnly={submittedMineOnly}
            onReset={handleResetSearch}
            onSelectVideo={handleSelectVideo}
            search={submittedSearch}
            target={submittedTarget}
          />
        </Box>
      ) : null}

      <AddInstanceDialog
        open={addInstanceOpen}
        onClose={() => setAddInstanceOpen(false)}
        onAdded={() => {
          void instancesQuery.refetch();
        }}
      />
    </Box>
  );
}
