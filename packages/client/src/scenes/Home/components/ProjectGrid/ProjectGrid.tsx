import { listProjectsThunk } from 'actions/ProjectActions';
import TagSearchBox from 'components/TagSearchBox/TagSearchBox';
import { isMember, isOwner, isAdmin } from 'utils/ProjectUtils';
import { ProjectGraphRecord, TagData, UserRecord } from '@celluloid/types';
import {
  Chip,
  createStyles,
  Fade,
  Theme,
  Toolbar,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Grow from '@material-ui/core/Grow';
import { listTagsThunk } from 'actions/TagActions';
import classNames from 'classnames';
import * as R from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { Dispatch } from 'redux';
import { AsyncAction } from 'types/ActionTypes';
import { AppState } from 'types/StateTypes';

import ProjectThumbnail from './ProjectThumbnail';
import { WithI18n, withI18n } from 'react-i18next';

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
  },
  noProjects: {
    fontWeight: 'bold',
    color: theme.palette.grey[300]
  },
  error: {
    fontWeight: 'bold',
    color: theme.palette.error.light
  }
});

interface Props extends WithStyles<typeof styles> {
  user?: UserRecord;
  projects: ProjectGraphRecord[];
  tags: TagData[];
  error?: string;
  loadProjects(): AsyncAction<ProjectGraphRecord[], string>;
  loadTags(): AsyncAction<TagData[], string>;
}

interface State {
  selectedTags: TagData[];
}

const mapStateToProps = (state: AppState) => ({
  user: state.user,
  projects: state.home.projects,
  tags: state.tags,
  error: state.home.errors.projects
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadTags: () => listTagsThunk()(dispatch),
  loadProjects: () => listProjectsThunk()(dispatch)
});

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(
    withI18n()(class extends React.Component<Props & WithI18n, State> {
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
        if (!R.equals(prevProps.user, this.props.user)) {
          this.load();
        }
      }

      render() {
        const { projects, tags, user, error, classes, t } = this.props;

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
          !!user && (isOwner(project, user) || isMember(project, user) || isAdmin(user))
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

        const noProjects =
          !error && publicProjects.length === 0 && userProjects.length === 0;

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
                prefix={t('tagSearch.prefix')}
                onTagSelected={onTagSelected}
                label={t('home.searchProject')}
              />
            </Toolbar>
            <div className={classes.grid}>
              {userProjects.length > 0 &&
                <>
                  <Fade in={userProjects.length > 0} appear={true}>
                    <Typography
                      gutterBottom={true}
                      color="primary"
                      variant="h4"
                      className={classes.sectionTitle}
                    >
                      {t('home.myProjects')}
                    </Typography>
                  </Fade>
                  <Grid container={true} spacing={40} direction="row">
                    <TransitionGroup component={null} appear={true}>
                      {userProjects.map((project: ProjectGraphRecord) =>
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
                  <Fade in={publicProjects.length > 0} appear={true}>
                    <Typography
                      gutterBottom={true}
                      color="primary"
                      variant="h4"
                      className={classes.sectionTitle}
                    >
                      {t('home.publicProjects')}
                    </Typography>
                  </Fade>
                  <Grid container={true} spacing={40} direction="row">
                    <TransitionGroup component={null} appear={true}>
                      {publicProjects.map((project: ProjectGraphRecord) =>
                        <Grow in={true} appear={true} key={project.id}>
                          <ProjectThumbnail showPublic={false} {...project} />
                        </Grow>
                      )}
                    </TransitionGroup>
                  </Grid>
                </>
              }
              {noProjects &&
                <Fade in={noProjects} appear={true}>
                  <Typography
                    variant="h3"
                    align="center"
                    gutterBottom={true}
                    className={classNames(classes.sectionTitle, classes.noProjects)}
                  >
                    {t('home.emptySearchResult')}
                  </Typography>
                </Fade>
              }
              {error &&
                <Fade in={!!error} appear={true}>
                  <Typography
                    variant="h4"
                    align="center"
                    gutterBottom={true}
                    className={classNames(classes.sectionTitle, classes.error)}
                  >
                    {error}
                  </Typography>
                </Fade>
              }
            </div>
          </>
        );
      }
    })
  )
);
