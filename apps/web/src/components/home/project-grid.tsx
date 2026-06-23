"use client";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SortIcon from "@mui/icons-material/Sort";
import {
  Box,
  CircularProgress,
  Container,
  Divider,
  Fade,
  IconButton,
  InputBase,
  MenuItem,
  Pagination,
  Paper,
  Select,
  type SelectChangeEvent,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { parseAsInteger, useQueryState } from "nuqs";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ProjectThumbnail } from "@/components/common/project-thumbnail";
import { useSession } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import type { ProjectListItem } from "@/lib/trpc/types";

// const ProjectTitle = dynamic(() => import("./project-title"), {
//   ssr: false,
//   loading: () => <Skeleton variant="text" height={60} width={200} />,
// });

const ITEMS_PER_PAGE = 12;

export function ProjectGrid() {
  type ProjectScope = "explorer" | "my" | "collaboration";
  type ProjectSort = "recent_added" | "publication_date" | "name";
  const searchInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations();
  const api = useTRPC();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [searchTerm, setSearchTerm] = useQueryState("q");
  const [scope, setScope] = useQueryState<ProjectScope>("scope", {
    defaultValue: "explorer",
    parse: (value) =>
      value === "explorer" || value === "my" || value === "collaboration"
        ? value
        : "explorer",
    serialize: (value) => value,
  });
  const [sortBy, setSortBy] = useQueryState<ProjectSort>("sort", {
    defaultValue: "recent_added",
    parse: (value) =>
      value === "recent_added" ||
      value === "publication_date" ||
      value === "name"
        ? value
        : "recent_added",
    serialize: (value) => value,
  });
  const [hydrated, setHydrated] = useState(false);

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
  const isLoggedIn = Boolean(session?.user);
  const showAuthTabs = hydrated && isLoggedIn;
  const effectiveScope: ProjectScope = showAuthTabs ? scope : "explorer";

  const { data, isFetching, isLoading, error, refetch } = useQuery(
    api.project.list.queryOptions({
      term: searchTerm ?? undefined,
      pageSize: ITEMS_PER_PAGE,
      page: page,
      scope: effectiveScope,
      sortBy,
    }),
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (session && !isFetching) {
      refetch();
    }
  }, [session]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const showResultsSkeleton =
    !hydrated || (isLoading && !data) || (isFetching && searchTerm != null);
  const noProjects = !showResultsSkeleton && items.length === 0;

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

  const handleScopeChange = (
    _event: React.SyntheticEvent,
    newScope: ProjectScope,
  ) => {
    setScope(newScope);
    setPage(1);
  };

  const handleSortChange = (event: SelectChangeEvent<ProjectSort>) => {
    setSortBy(event.target.value as ProjectSort);
    setPage(1);
  };

  if (error) {
    return (
      <Box sx={{ py: { xs: 2, md: 4 }, minHeight: "100vh" }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Typography color="error">{t("errors.LOADING_PROJECTS")}</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: { xs: 2, md: 5 },
        backgroundColor: "brand.orange",
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            my: { xs: 2, md: 3 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            gap: 2,
          }}
        >
          <Tabs
            value={effectiveScope}
            onChange={handleScopeChange}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons={false}
            allowScrollButtonsMobile
            sx={{
              flex: 1,
              minHeight: 48,
              width: "100%",
              "& .MuiTabs-scroller": {
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              },
              "& .MuiTabs-flexContainer": {
                gap: { xs: 1, md: 2 },
              },
              "& .MuiTab-root": {
                minHeight: 48,
                minWidth: "auto",
                px: { xs: 0.5, md: 1.5 },
                fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                fontFamily: "var(--font-serif)",
                fontWeight: 700,
                color: "black",
                textTransform: "none",
                whiteSpace: "nowrap",
              },
              "& .MuiTab-root + .MuiTab-root": {
                ml: 0,
              },
            }}
          >
            <Tab value="explorer" label={t("home.explorer")} />
            {showAuthTabs ? (
              <Tab value="my" label={t("home.myProjects")} />
            ) : null}
            {showAuthTabs ? (
              <Tab value="collaboration" label={t("home.collaboration")} />
            ) : null}
          </Tabs>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              width: { xs: "100%", md: "auto" },
            }}
          >
            <Paper className="flex h-[50px] w-full shrink-0 items-center rounded-full px-1 py-[2px] sm:w-[260px] shadow-none">
              <SearchIcon className="ml-1 size-10 p-2 text-black/50" />
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
            <Paper className="flex h-[50px] w-full shrink-0 items-center rounded-full px-1 py-[2px] sm:w-[220px] shadow-none">
              <SortIcon className="ml-1 size-10 p-2 text-black/50" />
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              <Select
                value={sortBy}
                onChange={handleSortChange}
                variant="standard"
                disableUnderline
                sx={{
                  flex: 1,
                  ml: 1,
                  "& .MuiSelect-select": {
                    py: 0.75,
                  },
                }}
              >
                <MenuItem value="recent_added">
                  {t("home.sortBy.recent_added")}
                </MenuItem>
                <MenuItem value="publication_date">
                  {t("home.sortBy.publication_date")}
                </MenuItem>
                <MenuItem value="name">{t("home.sortBy.name")}</MenuItem>
              </Select>
            </Paper>
          </Box>
        </Box>
        {showResultsSkeleton ? (
          <ProjectGridContentSkeleton />
        ) : (
          <Grid container spacing={{ xs: 2, md: 5 }}>
            {items.map((project: ProjectListItem) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={project.id}>
                <ProjectThumbnail showPublic={true} project={project} />
              </Grid>
            ))}
          </Grid>
        )}

        {noProjects && (
          <Box
            sx={{
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <Stack
              sx={{
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
                py: { xs: 2, md: 4 },
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
        {!noProjects && items.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              pt: { xs: 2, md: 4 },
              pb: { xs: 1, md: 2 },
            }}
          >
            <Pagination
              count={Math.ceil(total / ITEMS_PER_PAGE)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}

function ProjectGridContentSkeleton() {
  return (
    <Grid container spacing={{ xs: 2, md: 5 }}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={item}>
          <Skeleton
            variant="rectangular"
            sx={{
              width: "100%",
              height: 200,
              borderRadius: 2,
            }}
          />
          <Skeleton
            variant="text"
            sx={{
              width: "80%",
              height: 24,
              mt: 1,
            }}
          />
          <Skeleton
            variant="text"
            sx={{
              width: "60%",
              height: 20,
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
}
