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
import { ProjectThumbnail } from "@/components/common/project-thumbnail";
import { useTRPC } from "@/lib/trpc/client";

const ITEMS_PER_PAGE = 12;

export const UserProjectsGrid: React.FC = () => {
  const t = useTranslations();
  const api = useTRPC();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const {
    data: projectsData,
    error: projectsError,
    isFetching: projectsFetching,
  } = useQuery(
    api.user.projects.queryOptions({
      pageSize: ITEMS_PER_PAGE,
      page,
    }),
  );

  // Track next cursor for the next page when user clicks forward
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    setPage(newPage);
  };
  const totalPages = Math.max(
    1,
    Math.ceil((projectsData?.total ?? 0) / ITEMS_PER_PAGE),
  );
  const isLoading = projectsFetching || !projectsData;

  if (isLoading) {
    return (
      <Box
        sx={{
          mx: 2,
          my: 10,
          display: "flex",
          alignContent: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
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
