import { listProjectsThunk } from '@celluloid/client/src/actions/ProjectActions';
import TagSearchBox from '@celluloid/client/src/components/TagSearchBox/TagSearchBox';
import { ProjectGraphRecord, TagData, UserRecord } from '@celluloid/types';
import { Toolbar, Chip, Typography, Theme, createStyles, WithStyles, withStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Grow from '@material-ui/core/Grow';
import { listTagsThunk } from 'actions/TagActions';
import * as R from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { Dispatch } from 'redux';
import { AsyncAction } from 'types/ActionTypes';
import { AppState } from 'types/StateTypes';

import ProjectThumbnail from './ProjectThumbnail';
import { isOwner, isMember } from '@celluloid/client/src/utils/ProjectUtils';

const projectMatchesTag = (project: ProjectGraphRecord) =>
  (tag: TagData) =>
    !!R.find((elem: TagData) => R.equals(elem, tag))(project.tags);

const styles = (theme: Theme) => createStyles({
  grid: {
    paddingLeft: (theme.spacing.unit * 5) / 2,
    paddingRight: (theme.spacing.unit * 5) / 2,
  },
  tags: {
    paddingBottom: theme.spacing.unit * 2
  },
  sectionTitle: {
    paddingTop: theme.spacing.unit * 4,
    paddingBottom: theme.spacing.unit
  }
});

interface Props extends WithStyles<typeof styles> {
  user?: UserRecord;
  projects: ProjectGraphRecord[];
  tags: TagData[];
  loadProjects(): AsyncAction<ProjectGraphRecord[], string>;
  loadTags(): AsyncAction<TagData[], string>;
}

interface State {
  selectedTags: TagData[];
}

const mapStateToProps = (state: AppState) => ({
  user: state.user,
  projects: state.home.projects,
  tags: state.tags
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadTags: () => listTagsThunk()(dispatch),
  loadProjects: () => listProjectsThunk()(dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles)(class extends React.Component<Props, State> {
    state = {
      selectedTags: []
    };

    load() {
      this.props.loadProjects();
      this.props.loadTags();
    }

    componentDidMount() {
      this.load();
    }

    componentDidUpdate(prevProps: Props) {
      if (prevProps.user !== this.props.user) {
        this.load();
      }
    }

    render() {
      const { projects, tags, user, classes } = this.props;

      const { selectedTags } = this.state;

      const sort = R.sortWith([
        R.descend(R.prop('publishedAt'))
      ]);

      const filtered = selectedTags.length > 0
        ? R.filter((project: ProjectGraphRecord) => {
          const matchesTag = projectMatchesTag(project);
          return selectedTags.reduce(
            (acc, tag) => matchesTag(tag),
            true
          );
        })(projects)
        : projects;

      const sorted = sort(filtered) as ProjectGraphRecord[];

      const userProjects = R.filter((project: ProjectGraphRecord) =>
        !!user && (isOwner(project, user) || isMember(project, user))
      )(sorted);

      const publicProjects = R.difference(sorted, userProjects);

      const isTagSelected = (tag: TagData) =>
        R.find((elem: TagData) =>
          R.equals(elem, tag)
        )(selectedTags);

      const removeTag = (tag: TagData) =>
        R.filter((elem: TagData) =>
          !R.equals(elem, tag)
        )(selectedTags);

      const onTagSelected = (tag: TagData) => {
        this.setState(state => ({
          selectedTags: isTagSelected(tag)
            ? removeTag(tag)
            : [...state.selectedTags, tag]
        }));
      };

      return (
        <>
          <Toolbar>
            <div className={classes.tags}>
              {tags.map(tag =>
                <Chip
                  onClick={() => onTagSelected(tag)}
                  onDelete={isTagSelected(tag)
                    ? (() => onTagSelected(tag))
                    : undefined
                  }
                  key={tag.id}
                  label={tag.name}
                  style={{
                    margin: 4
                  }}
                />
              )}
            </div>
          </Toolbar>
          <Toolbar>
            <TagSearchBox
              prefix="Domaine: "
              onTagSelected={onTagSelected}
              label="Rechercher un projet..."
            />
          </Toolbar>
          <div className={classes.grid}>
            {userProjects.length > 0 &&
              <>
                <Typography
                  gutterBottom={true}
                  color="primary"
                  variant="h4"
                  className={classes.sectionTitle}
                >
                  {`Mes projets`}
                </Typography>
                <Grid container={true} spacing={40} direction="row">
                  <TransitionGroup component={null} appear={true}>
                    {sorted.map((project: ProjectGraphRecord) =>
                      <Grow in={true} appear={true} key={project.id}>
                        <ProjectThumbnail showPublic={true} {...project} />
                      </Grow>
                    )}
                  </TransitionGroup>
                </Grid>
              </>
            }
            {publicProjects.length > 0 &&
              <>
                <Typography
                  gutterBottom={true}
                  color="primary"
                  variant="h4"
                  className={classes.sectionTitle}
                >
                  {`Projets publics`}
                </Typography>
                <Grid container={true} spacing={40} direction="row">
                  <TransitionGroup component={null} appear={true}>
                    {sorted.map((project: ProjectGraphRecord) =>
                      <Grow in={true} appear={true} key={project.id}>
                        <ProjectThumbnail showPublic={false} {...project} />
                      </Grow>
                    )}
                  </TransitionGroup>
                </Grid>
              </>
            }
          </div>
        </>
      );
    }
  })
);