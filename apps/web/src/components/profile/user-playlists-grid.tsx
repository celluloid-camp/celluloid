"use client";
import {
  Box,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc/client";
import PlaylistThumbnail from "./playlist-thumbnail";

const ITEMS_PER_PAGE = 12;

export const UserPlaylistsGrid: React.FC = () => {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<Map<number, string>>(
    new Map(),
  );

  // Get cursor for current page (page 1 has no cursor)
  const cursor = useMemo(() => {
    if (page === 1) return undefined;
    return pageCursors.get(page) ?? undefined;
  }, [page, pageCursors]);

  const {
    data: playlistsData,
    error: playlistsError,
    isFetching: playlistsFetching,
  } = trpc.user.playlists.useQuery({
    limit: ITEMS_PER_PAGE,
    cursor,
  });

  // Track next cursor for the next page
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

  if (playlistsFetching || !playlistsData) {
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
          ph: 2,
        }}
      >
        {playlistsData.items?.length > 0 && (
          <Grid container={true} spacing={5} direction="row">
            {playlistsData.items.map((playlist) => (
              <Grid xs={12} sm={6} lg={4} xl={3} item key={playlist.id}>
                <PlaylistThumbnail
                  playlist={{
                    ...playlist,
                    publishedAt:
                      typeof playlist.publishedAt === "string"
                        ? playlist.publishedAt
                        : playlist.publishedAt.toISOString(),
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {playlistsData.items.length === 0 && (
          <Typography
            variant="h3"
            align="center"
            gutterBottom={true}
            sx={{
              pt: 4,
              pb: 1,
            }}
          >
            {t("profile.me.playlist.empty")}
          </Typography>
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
    </Stack>
  );
};
