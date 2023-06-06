import { ProjectGraphRecord } from "@celluloid/types";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  CircularProgress,
  Container,
  Divider,
  Fade,
  IconButton,
  InputBase,
  Paper,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import * as R from "ramda";
import * as React from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TransitionGroup } from "react-transition-group";
import { useDidUpdate } from "rooks";

import { StyledTitle } from "~components/typography";
import { useMe, useProjects } from "~hooks/use-user";
import { isAdmin, isMember, isOwner } from "~utils/ProjectUtils";

import ProjectThumbnail from "./ProjectThumbnail";

export const ProjectGrid: React.FC = () => {
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

  // Debounce the search function
  const debouncedSearch = debounce((value: string) => {
    if (value.length >= 3) {
      setSearchTerm(value);
    }
  }, 300);

  const { data: user } = useMe();
  const { data: projects = [], error, isLoading } = useProjects(searchTerm);

  const { t } = useTranslation();

  useDidUpdate(() => {
    queryClient.invalidateQueries(["projects"]);
  }, [user]);

  const sort = R.sortWith([R.descend(R.prop("publishedAt"))]);

  const sorted = sort(projects) as ProjectGraphRecord[];

  const userProjects = R.filter(
    (project: ProjectGraphRecord) =>
      !!user &&
      (isOwner(project, user) || isMember(project, user) || isAdmin(user))
  )(sorted);

  const publicProjects = R.difference(sorted, userProjects);

  const noProjects =
    !error && publicProjects.length === 0 && userProjects.length === 0;

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

  return (
    <Box sx={{ padding: 5, backgroundColor: "brand.orange" }}>
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
          <IconButton sx={{ p: "10px", ml: 1 }} aria-label="menu">
            <SearchIcon />
          </IconButton>
          {/* <CircularProgress sx={{ p: "10px", ml: 1 }} /> */}
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            inputRef={searchInputRef}
            onChange={handleSearchChange}
            placeholder={t("search.placeholder", "Chercher un projet") || ""}
          />
          {searchTerm ? (
            <IconButton onClick={handleResetSearch}>
              <ClearIcon />
            </IconButton>
          ) : null}
        </Paper>

        {isLoading ? (
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
        ) : null}

        <Box
          sx={{
            ph: 2,
          }}
        >
          {userProjects.length > 0 && (
            <>
              <Fade in={userProjects.length > 0} appear={true}>
                <StyledTitle gutterBottom={true} variant="h4">
                  {t("home.myProjects")}
                </StyledTitle>
              </Fade>
              <Grid container={true} spacing={5} direction="row">
                <TransitionGroup component={null} appear={true}>
                  {userProjects.map((project: ProjectGraphRecord) => (
                    <Grid xs={12} sm={6} lg={4} xl={3} item>
                      <ProjectThumbnail
                        showPublic={true}
                        project={project}
                        key={project.id}
                      />
                    </Grid>
                  ))}
                </TransitionGroup>
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
                <TransitionGroup component={null} appear={true}>
                  {publicProjects.map((project: ProjectGraphRecord) => (
                    <Grid xs={12} sm={6} lg={4} xl={3} item>
                      <ProjectThumbnail
                        showPublic={false}
                        project={project}
                        key={project.id}
                      />
                    </Grid>
                  ))}
                </TransitionGroup>
              </Grid>
            </>
          )}

          {!isLoading && noProjects && (
            <Fade in={noProjects} appear={true}>
              <Typography
                variant="h3"
                align="center"
                gutterBottom={true}
                sx={{
                  pt: 4,
                  pb: 1,
                }}
              >
                {t("home.emptySearchResult")}
              </Typography>
            </Fade>
          )}
          {error ? (
            <Fade in={!!error} appear={true}>
              <Typography
                variant="h6"
                align="center"
                gutterBottom={true}
                sx={{
                  pt: 4,
                  pb: 1,
                }}
              >
                {t("ERR_UNKOWN")}
              </Typography>
            </Fade>
          ) : null}
        </Box>
      </Container>
    </Box>
  );
};
