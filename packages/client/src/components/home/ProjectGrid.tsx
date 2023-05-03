import { ProjectGraphRecord, TagData, UserRecord } from "@celluloid/types";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Fade,
  IconButton,
  InputBase,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import * as R from "ramda";
import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { TransitionGroup } from "react-transition-group";
import { Dispatch } from "redux";
import { useDidUpdate } from "rooks";

import { listProjectsThunk } from "~actions/ProjectActions";
import { listTagsThunk } from "~actions/TagActions";
import { AsyncAction } from "~types/ActionTypes";
import { AppState } from "~types/StateTypes";
import { isAdmin, isMember, isOwner } from "~utils/ProjectUtils";

import ProjectThumbnail from "./ProjectThumbnail";

const projectMatchesTag = (project: ProjectGraphRecord) => (tag: TagData) =>
  !!R.find((elem: TagData) => R.equals(elem, tag))(project.tags);

// const styles = (theme: Theme) =>
//   createStyles({
//     grid: {
//       paddingLeft: (theme.spacing.unit * 5) / 2,
//       paddingRight: (theme.spacing.unit * 5) / 2,
//     },
//     tags: {
//       paddingBottom: theme.spacing.unit * 2,
//     },
//     sectionTitle: {
//       paddingTop: theme.spacing.unit * 4,
//       paddingBottom: theme.spacing.unit,
//     },
//     noProjects: {
//       fontWeight: "bold",
//       color: theme.palette.grey[300],
//     },
//     error: {
//       fontWeight: "bold",
//       color: theme.palette.error.light,
//     },
//   });

interface Props {
  user?: UserRecord;
  projects: ProjectGraphRecord[];
  tags: TagData[];
  error?: string;
  loadProjects(): AsyncAction<ProjectGraphRecord[], string>;
  loadTags(): AsyncAction<TagData[], string>;
}

const mapStateToProps = (state: AppState) => ({
  user: state.user,
  projects: state.home.projects,
  tags: state.tags,
  error: state.home.errors.projects,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadTags: () => listTagsThunk()(dispatch),
  loadProjects: () => listProjectsThunk()(dispatch),
});

const ProjectGrid: React.FC<Props> = ({
  loadProjects,
  loadTags,
  user,
  projects,
  tags,
  error,
}) => {
  const [selectedTags, setSelectedTags] = useState<TagData[]>([]);
  const { t } = useTranslation();

  const load = () => {
    loadProjects();
    loadTags();
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    load();
  }, [user]);

  const sort = R.sortWith([R.descend(R.prop("publishedAt"))]);

  const filtered =
    selectedTags.length > 0
      ? R.filter((project: ProjectGraphRecord) => {
          const matchesTag = projectMatchesTag(project);
          return selectedTags.reduce((_, tag) => matchesTag(tag), true);
        })(projects)
      : projects;

  const sorted = sort(filtered) as ProjectGraphRecord[];

  const userProjects = R.filter(
    (project: ProjectGraphRecord) =>
      !!user &&
      (isOwner(project, user) || isMember(project, user) || isAdmin(user))
  )(sorted);

  const publicProjects = R.difference(sorted, userProjects);

  const isTagSelected = (tag: TagData) =>
    R.find((elem: TagData) => R.equals(elem, tag))(selectedTags);

  const removeTag = (tag: TagData) =>
    R.filter((elem: TagData) => !R.equals(elem, tag))(selectedTags);

  const onTagSelected = (tag: TagData) => {
    setSelectedTags(
      isTagSelected(tag) ? removeTag(tag) : [...selectedTags, tag]
    );

    // this.setState((state) => ({
    //   selectedTags: isTagSelected(tag)
    //     ? removeTag(tag)
    //     : [...state.selectedTags, tag],
    // }));
  };

  const noProjects =
    !error && publicProjects.length === 0 && userProjects.length === 0;

  return (
    <Box sx={{ padding: 5, backgroundColor: "brand.orange" }}>
      <Container maxWidth="lg">
        {/* <Toolbar>
        <Box sx={{ paddingBottom: 2 }}>
          {tags.map((tag) => (
            <Chip
              onClick={() => onTagSelected(tag)}
              onDelete={
                isTagSelected(tag) ? () => onTagSelected(tag) : undefined
              }
              key={tag.id}
              label={tag.name}
              style={{
                margin: 4,
              }}
            />
          ))}
        </Box>
      </Toolbar>
      <Toolbar>
        <TagSearchBox
          prefix={t("tagSearch.prefix") || ""}
          onTagSelected={onTagSelected}
          label={t("home.searchProject")}
        />
      </Toolbar> */}

        <Paper
          component="form"
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
            placeholder={t("search.placeholder", "Chercher un projet") || ""}
          />
        </Paper>

        <Box
          sx={{
            ph: 2,
          }}
        >
          {userProjects.length > 0 && (
            <>
              <Fade in={userProjects.length > 0} appear={true}>
                <Typography
                  gutterBottom={true}
                  variant="h4"
                  fontFamily={"abril_fatfaceregular"}
                  sx={{
                    pt: 4,
                    pb: 1,
                  }}
                >
                  {t("home.myProjects")}
                </Typography>
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
                <Typography
                  gutterBottom={true}
                  color="primary"
                  variant="h4"
                  sx={{
                    pt: 4,
                    pb: 1,
                  }}
                >
                  {t("home.publicProjects")}
                </Typography>
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
          {noProjects && (
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
          {error && (
            <Fade in={!!error} appear={true}>
              <Typography
                variant="h4"
                align="center"
                gutterBottom={true}
                sx={{
                  pt: 4,
                  pb: 1,
                }}
              >
                {error}
              </Typography>
            </Fade>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectGrid);
