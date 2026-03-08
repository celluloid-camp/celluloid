"use client";
import AddIcon from "@mui/icons-material/Add";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import {
  Box,
  Button,
  CircularProgress,
  Pagination,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { useTRPC } from "@/lib/trpc/client";
import CreatePlaylistDialog from "./create-playlist-dialog";
import PlaylistThumbnail from "./playlist-thumbnail";

const ITEMS_PER_PAGE = 12;

export const UserPlaylistsGrid: React.FC = () => {
  const t = useTranslations();
  const api = useTRPC();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageCursors, setPageCursors] = useState<Map<number, string>>(
    new Map(),
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Get cursor for current page (page 1 has no cursor)
  const cursor = useMemo(() => {
    if (page === 1) return undefined;
    return pageCursors.get(page) ?? undefined;
  }, [page, pageCursors]);

  const {
    data: playlistsData,
    error: playlistsError,
    isFetching: playlistsFetching,
  } = useQuery(
    api.user.playlists.queryOptions({
      limit: ITEMS_PER_PAGE,
      cursor,
    }),
  );

  // Which page does the current data represent? (cursor undefined => page 1)
  const dataPage = useMemo(() => {
    if (cursor === undefined) return 1;
    const entry = Array.from(pageCursors.entries()).find(
      ([, c]) => c === cursor,
    );
    return entry?.[0] ?? 1;
  }, [cursor, pageCursors]);

  // Bootstrap: when landing on ?page=N, fetch page 1 then 2… to collect cursors
  useEffect(() => {
    if (!playlistsData?.nextCursor || dataPage >= page) return;
    const nextPage = dataPage + 1;
    setPageCursors((prev) => {
      if (prev.has(nextPage)) return prev;
      const next = new Map(prev);
      next.set(nextPage, playlistsData.nextCursor!);
      return next;
    });
  }, [dataPage, page, playlistsData?.nextCursor]);

  // Track next cursor for the next page when user clicks forward
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    if (playlistsData?.nextCursor && newPage > page) {
      // Store the cursor for the next page
      setPageCursors((prev) => {
        const newMap = new Map(prev);
        newMap.set(newPage, playlistsData.nextCursor!);
        return newMap;
      });
    }
    setPage(newPage);
  };

  // Calculate total pages based on whether we have a next cursor
  // Since we're using cursor-based pagination, we can't know the exact total
  // We'll show pages based on whether there's a next page available
  const hasNextPage = !!playlistsData?.nextCursor;
  const totalPages = hasNextPage ? page + 1 : page;

  const isLoading = playlistsFetching || !playlistsData || dataPage !== page;

  if (isLoading) {
    return (
      <Box
        mx={2}
        my={10}
        display={"flex"}
        alignContent={"center"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Box>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          {t("playlist.create.button")}
        </Button>
      </Box>
      <Box
        sx={{
          ph: 2,
        }}
      >
        {playlistsData.items?.length > 0 && (
          <Grid container spacing={5}>
            {playlistsData.items.map((playlist) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={playlist.id}>
                <PlaylistThumbnail
                  playlist={{
                    ...playlist,
                    publishedAt:
                      typeof playlist.publishedAt === "string"
                        ? playlist.publishedAt
                        : (playlist.publishedAt as Date).toISOString(),
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {playlistsData.items.length === 0 && (
          <Paper
            variant="outlined"
            sx={{
              py: 8,
              px: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              maxWidth: 420,
              mx: "auto",
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                color: "text.secondary",
                mb: 2,
                "& .MuiSvgIcon-root": { fontSize: 64 },
              }}
            >
              <PlaylistPlayIcon />
            </Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {t("profile.me.playlist.empty")}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 320 }}
            >
              {t("profile.me.playlist.emptyDescription")}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              {t("playlist.create.button")}
            </Button>
          </Paper>
        )}
        {playlistsError ? (
          <Typography
            variant="h6"
            align="center"
            gutterBottom={true}
            sx={{
              pt: 4,
              pb: 1,
            }}
          >
            {t("errors.UNKNOWN")}
          </Typography>
        ) : null}
      </Box>

      {playlistsData.items.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pt: 3,
            pb: 2,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      <CreatePlaylistDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </Stack>
  );
};
