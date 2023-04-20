import { ProjectGraphRecord, TagData, UserRecord } from "@celluloid/types";
import { Box, Chip, Fade as FadeMUI, Toolbar, Typography } from "@mui/material";
import { FadeProps } from "@mui/material/Fade";
import Grid from "@mui/material/Grid";
import { listProjectsThunk } from "actions/ProjectActions";
import { listTagsThunk } from "actions/TagActions";
import TagSearchBox from "components/TagSearchBox/TagSearchBox";
import * as R from "ramda";
import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { TransitionGroup } from "react-transition-group";
import { Dispatch } from "redux";
import { useDidUpdate } from "rooks";
import { AsyncAction } from "types/ActionTypes";
import { AppState } from "types/StateTypes";
import { isAdmin, isMember, isOwner } from "utils/ProjectUtils";

import ProjectThumbnail from "./ProjectThumbnail";

const Fade: React.FC<React.PropsWithChildren & FadeProps> = (props) => (
  <FadeMUI {...props} />
);

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
          return selectedTags.reduce((acc, tag) => matchesTag(tag), true);
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
    <>
      <Toolbar>
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
          prefix={t("tagSearch.prefix")}
          onTagSelected={onTagSelected}
          label={t("home.searchProject")}
        />
      </Toolbar>
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
                color="primary"
                variant="h4"
                sx={{
                  pt: 4,
                  pb: 1,
                }}
              >
                {t("home.myProjects")}
              </Typography>
            </Fade>
            <Grid container={true} spacing={40} direction="row">
              <TransitionGroup component={null} appear={true}>
                {userProjects.map((project: ProjectGraphRecord) => (
                  <ProjectThumbnail
                    showPublic={true}
                    project={project}
                    key={project.id}
                  />
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
            <Grid container={true} spacing={40} direction="row">
              <TransitionGroup component={null} appear={true}>
                {publicProjects.map((project: ProjectGraphRecord) => (
                  <ProjectThumbnail
                    showPublic={false}
                    project={project}
                    key={project.id}
                  />
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
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectGrid);
