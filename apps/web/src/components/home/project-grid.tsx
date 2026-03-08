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
import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useSuspenseQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { parseAsInteger, useQueryState } from "nuqs";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ProjectThumbnail } from "@/components/common/project-thumbnail";
import { useSession } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
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
  const api = useTRPC();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [searchTerm, setSearchTerm] = useQueryState("q");

  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      setPage(1);
      if (value.length >= 3) {
        setSearchTerm(value);
      } else if (value.length === 0) {
        setSearchTerm(null);
      }
    },
    { wait: 1000 },
  );

  const { data: session } = useSession();

  const { data, isFetching, error, refetch } = useSuspenseQuery(
    api.project.list.queryOptions({
      term: searchTerm ?? undefined,
      pageSize: ITEMS_PER_PAGE,
      page: page,
    }),
  );

  useEffect(() => {
    if (session && !isFetching) {
      refetch();
    }
  }, [session]);

  const noProjects = data.items.length === 0;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    debouncedSearch(value);
  };

  const handleResetSearch = () => {
    setSearchTerm(null);
    setPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  // Track next cursor for the next page
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  if (error) {
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
          {isFetching ? (
            <CircularProgress sx={{ p: "10px", ml: 1 }} size={20} />
          ) : (
            <IconButton sx={{ p: "10px", ml: 1 }} aria-label="menu">
              <SearchIcon />
            </IconButton>
          )}
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <InputBase
            key={searchTerm ?? "empty"}
            sx={{ ml: 1, flex: 1 }}
            inputRef={searchInputRef}
            defaultValue={searchTerm ?? ""}
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
          <Grid container spacing={5}>
            {data.items.map((project: ProjectListItem) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={project.id}>
                <ProjectThumbnail showPublic={true} project={project} />
              </Grid>
            ))}
          </Grid>

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
                count={Math.ceil(data.total / ITEMS_PER_PAGE)}
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
