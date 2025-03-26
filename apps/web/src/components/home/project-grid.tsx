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
  Paper,
  Stack,
  Typography,
  Skeleton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { debounce } from "lodash";
import * as R from "ramda";
import type * as React from "react";
import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { StyledTitle } from "@/components/common/typography";
import { trpc } from "@/lib/trpc/client";

import ProjectThumbnail from "@/components/common/project-thumbnail";
import { useSession } from "@/lib/auth-client";
import type { ProjectListItem } from "@/lib/trpc/types";

const ProjectGridSkeleton: React.FC = () => {
  return (
    <Box
      sx={{
        padding: 5,
        backgroundColor: "brand.orange",
      }}
    >
      <Container maxWidth="lg">
        <Skeleton
          variant="rectangular"
          sx={{
            borderRadius: 5,
            width: "100%",
            height: 50,
            mb: 4,
          }}
        />

        <Skeleton
          variant="text"
          sx={{
            width: 200,
            height: 40,
            mb: 3,
          }}
        />

        <Grid container={true} spacing={5} direction="row">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid xs={12} sm={6} lg={4} xl={3} item key={item}>
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
      </Container>
    </Box>
  );
};

export const ProjectGrid: React.FC = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

  // Debounce the search function
  const debouncedSearch = debounce((value: string) => {
    if (value.length >= 3) {
      setSearchTerm(value);
    } else if (value.length === 0) {
      setSearchTerm(undefined);
    }
  }, 1000);

  const { data: session } = useSession();

  const [data, mutation] = trpc.project.list.useSuspenseQuery({
    term: searchTerm,
  });

  const t = useTranslations();

  const userProjects = useMemo(
    () =>
      data.items
        .filter(
          (project: ProjectListItem) =>
            session?.user && project.userId === session?.user?.id
        )
        .sort(
          (a: ProjectListItem, b: ProjectListItem) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        ),
    [session?.user, data]
  );

  const publicProjects = R.difference(data.items, userProjects);

  const noProjects = publicProjects.length === 0 && userProjects.length === 0;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    debouncedSearch(value);
  };

  const handleResetSearch = () => {
    setSearchTerm(undefined);
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  if (mutation.error) {
    return (
      <Box sx={{ p: 5 }}>
        <Typography color="error">{t("errors.LOADING_PROJECTS")}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 5,
        backgroundColor: "brand.orange",
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
          {mutation.isFetching ? (
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
          {userProjects.length > 0 && (
            <>
              <Fade in={true} appear={true}>
                <StyledTitle gutterBottom={true} variant="h4">
                  {t("home.myProjects")}
                </StyledTitle>
              </Fade>
              <Grid container={true} spacing={5} direction="row">
                {userProjects.map((project: ProjectListItem) => (
                  <Grid xs={12} sm={6} lg={4} xl={3} item key={project.id}>
                    <ProjectThumbnail showPublic={true} project={project} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          {publicProjects.length > 0 && (
            <>
              <Fade in={publicProjects.length > 0} appear={true}>
                <StyledTitle
                  gutterBottom={true}
                  fontFamily={"abril_fatfaceregular"}
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
            <Fade in={noProjects} appear={true}>
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
            </Fade>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export { ProjectGridSkeleton };
