import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Box,
  CircularProgress,
  Container,
  Divider,
  Fade,
  IconButton,
  InputBase,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import * as R from "ramda";
import type * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import ProjectThumbnail from "@/components/common/project-thumbnail";
import { useSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import type { ProjectListItem } from "@/lib/trpc/types";
import { StyledTitle } from "../common/typography";

// const ProjectTitle = dynamic(() => import("./project-title"), {
//   ssr: false,
//   loading: () => <Skeleton variant="text" height={60} width={200} />,
// });

const ITEMS_PER_PAGE = 12;

export function ProjectGrid() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<Map<number, string>>(
    new Map(),
  );
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounce the search function
  const debouncedSearch = debounce((value: string) => {
    // Reset pagination when search changes
    setPage(1);
    setPageCursors(new Map());

    if (value.length >= 3) {
      setSearchTerm(value);
    } else if (value.length === 0) {
      setSearchTerm(undefined);
    }
  }, 1000);

  const { data: session } = useSession();

  // Get cursor for current page (page 1 has no cursor)
  const cursor = useMemo(() => {
    if (page === 1) return undefined;
    return pageCursors.get(page) ?? undefined;
  }, [page, pageCursors]);

  const [data, fetch] = trpc.project.list.useSuspenseQuery({
    term: searchTerm,
    limit: ITEMS_PER_PAGE,
    cursor,
  });

  // Reset pagination when search term changes externally
  useEffect(() => {
    setPage(1);
    setPageCursors(new Map());
  }, [searchTerm]);

  useEffect(() => {
    if (session && !fetch.isFetching) {
      fetch.refetch();
    }
  }, [session]);

  const ownProjects = useMemo(
    () =>
      data.items
        .filter(
          (project: ProjectListItem) =>
            session?.user && project.userId === session?.user?.id,
        )
        .sort(
          (a: ProjectListItem, b: ProjectListItem) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime(),
        ),
    [session?.user, data],
  );

  const joinedProjects = useMemo(
    () =>
      data.items
        .filter((project: ProjectListItem) =>
          project.members.some((member) => member.userId === session?.user?.id),
        )
        .sort(
          (a: ProjectListItem, b: ProjectListItem) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime(),
        ),
    [session?.user, data],
  );

  const publicProjects = R.difference(data.items, [
    ...ownProjects,
    ...joinedProjects,
  ]);

  const noProjects = data.items.length === 0;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    debouncedSearch(value);
  };

  const handleResetSearch = () => {
    setSearchTerm(undefined);
    setPage(1);
    setPageCursors(new Map());
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  // Track next cursor for the next page
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    if (data?.nextCursor && newPage > page) {
      // Store the cursor for the next page
      setPageCursors((prev) => {
        const newMap = new Map(prev);
        newMap.set(newPage, data.nextCursor!);
        return newMap;
      });
    } else if (newPage < page) {
      // If navigating back, remove the cursor for the current page
      setPageCursors((prev) => {
        const newMap = new Map(prev);
        newMap.delete(page);
        return newMap;
      });
    }
    setPage(newPage);
  };

  // Calculate total pages based on whether we have a next cursor
  const hasNextPage = !!data?.nextCursor;
  const totalPages = hasNextPage ? page + 1 : page;

  if (fetch.error) {
    return (
      <Box sx={{ p: 5, minHeight: "100vh" }}>
        <Typography color="error">{t("errors.LOADING_PROJECTS")}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 5,
        backgroundColor: "brand.orange",
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="lg">
        <Paper
          sx={{
            p: "2px 4px",
            display: "flex",
            borderRadius: 5,
            alignItems: "center",
            width: "100%",
            height: 50,
          }}
        >
          {fetch.isFetching ? (
            <CircularProgress sx={{ p: "10px", ml: 1 }} size={20} />
          ) : (
            <IconButton sx={{ p: "10px", ml: 1 }} aria-label="menu">
              <SearchIcon />
            </IconButton>
          )}
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            inputRef={searchInputRef}
            onChange={handleSearchChange}
            placeholder={t("search.placeholder")}
          />
          {searchTerm ? (
            <IconButton onClick={handleResetSearch}>
              <ClearIcon />
            </IconButton>
          ) : null}
        </Paper>

        <Box
          sx={{
            ph: 2,
          }}
        >
          {ownProjects.length > 0 && (
            <>
              <Fade in={true} appear={true}>
                <StyledTitle
                  sx={{
                    marginBottom: 2,
                  }}
                  variant="h4"
                >
                  {t("home.myProjects")}
                </StyledTitle>
              </Fade>
              <Grid container={true} spacing={5} direction="row">
                {ownProjects.map((project: ProjectListItem) => (
                  <Grid xs={12} sm={6} lg={4} xl={3} item key={project.id}>
                    <ProjectThumbnail showPublic={true} project={project} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {joinedProjects.length > 0 && (
            <>
              <Fade in={true} appear={true}>
                <StyledTitle
                  sx={{
                    marginBottom: 2,
                  }}
                  variant="h4"
                >
                  {t("home.member")}
                </StyledTitle>
              </Fade>
              <Grid container={true} spacing={5} direction="row">
                {joinedProjects.map((project: ProjectListItem) => (
                  <Grid xs={12} sm={6} lg={4} xl={3} item key={project.id}>
                    <ProjectThumbnail showPublic={true} project={project} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {publicProjects.length > 0 && (
            <>
              <Fade in={true} appear={true}>
                <StyledTitle
                  sx={{
                    marginBottom: 2,
                  }}
                  variant="h4"
                >
                  {t("home.publicProjects")}
                </StyledTitle>
              </Fade>
              <Grid container={true} spacing={5} direction="row">
                {publicProjects.map((project: ProjectListItem) => (
                  <Grid xs={12} sm={6} lg={4} xl={3} item key={project.id}>
                    <ProjectThumbnail showPublic={false} project={project} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {noProjects && (
            <Box
              display={"flex"}
              alignContent={"center"}
              justifyContent={"center"}
              alignItems={"center"}
              sx={{ minHeight: 200 }}
            >
              <Stack
                alignContent={"center"}
                justifyContent={"center"}
                alignItems={"center"}
                sx={{
                  py: 4,
                }}
              >
                <SearchOutlinedIcon
                  sx={{ width: 100, height: 100, color: "grey.800" }}
                />
                <Typography variant="h6" align="center">
                  {t("home.emptySearchResult")}
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Pagination */}
          {!noProjects && data.items.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                pt: 4,
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
        </Box>
      </Container>
    </Box>
  );
}
