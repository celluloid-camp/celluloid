"use client";
import {
  Box,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { ProjectThumbnail } from "@/components/common/project-thumbnail";
import { useTRPC } from "@/lib/trpc/client";

const ITEMS_PER_PAGE = 12;

export const UserProjectsGrid: React.FC = () => {
  const t = useTranslations();
  const api = useTRPC();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageCursors, setPageCursors] = useState<Map<number, string>>(
    new Map(),
  );

  // Get cursor for current page (page 1 has no cursor)
  const cursor = useMemo(() => {
    if (page === 1) return undefined;
    return pageCursors.get(page) ?? undefined;
  }, [page, pageCursors]);

  const {
    data: projectsData,
    error: projectsError,
    isFetching: projectsFetching,
  } = useQuery(
    api.user.projects.queryOptions({
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

  // Bootstrap: when landing on ?page=N, we may need to fetch page 1, then 2, … to
  // collect cursors. Each response’s nextCursor is the cursor for (dataPage + 1).
  useEffect(() => {
    if (!projectsData?.nextCursor || dataPage >= page) return;
    const nextPage = dataPage + 1;
    setPageCursors((prev) => {
      if (prev.has(nextPage)) return prev;
      const next = new Map(prev);
      next.set(nextPage, projectsData.nextCursor!);
      return next;
    });
  }, [dataPage, page, projectsData?.nextCursor]);

  // Track next cursor for the next page when user clicks forward
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    if (projectsData?.nextCursor && newPage > page) {
      // Store the cursor for the next page
      setPageCursors((prev) => {
        const newMap = new Map(prev);
        newMap.set(newPage, projectsData.nextCursor!);
        return newMap;
      });
    }
    setPage(newPage);
  };

  // Calculate total pages based on whether we have a next cursor
  // Since we're using cursor-based pagination, we can't know the exact total
  // We'll show pages based on whether there's a next page available
  const hasNextPage = !!projectsData?.nextCursor;
  const totalPages = hasNextPage ? page + 1 : page;

  const isLoading = projectsFetching || !projectsData || dataPage !== page;

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
          ph: 2,
        }}
      >
        {projectsData.items?.length > 0 && (
          <Grid container spacing={5}>
            {projectsData.items.map((project) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={project.id}>
                <ProjectThumbnail showPublic={true} project={project} />
              </Grid>
            ))}
          </Grid>
        )}

        {projectsData.items.length === 0 && (
          <Typography
            variant="h3"
            align="center"
            gutterBottom={true}
            sx={{
              pt: 4,
              pb: 1,
            }}
          >
            {t("profile.me.project.empty")}
          </Typography>
        )}
        {projectsError ? (
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

      {projectsData.items.length > 0 && (
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
