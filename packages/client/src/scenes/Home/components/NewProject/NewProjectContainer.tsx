import 'rc-slider/assets/index.css';

import { createProjectThunk } from '@celluloid/client/src/actions/ProjectActions';
import { createTagThunk } from '@celluloid/client/src/actions/TagActions';
import { Action, AsyncAction, EmptyAction } from '@celluloid/client/src/types/ActionTypes';
import { ProjectCreateData, ProjectGraphRecord, TagData } from '@celluloid/types';
import {
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
  TextField,
  Typography,
  Theme,
  withStyles,
  WithStyles,
  createStyles,
  LinearProgress,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { discardNewVideo } from 'actions/HomeActions';
import TagSearchBox from 'components/TagSearchBox/TagSearchBox';
import { Range } from 'rc-slider';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { levelLabel, levelsCount } from 'types/LevelTypes';
import { AppState } from 'types/StateTypes';
import { YoutubeVideo } from 'types/YoutubeTypes';
import * as R from 'ramda';
import DialogHeader from '@celluloid/client/src/components/DialogHeader';
import DialogError from '@celluloid/client/src/components/DialogError';
import { sliderTrackStyle, sliderHandleStyle, sliderRailStyle } from '@celluloid/client/src/utils/SliderUtils';

const styles = ({ spacing }: Theme) => createStyles({
  tagList: {
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: spacing.unit * 2,
    marginBottom: spacing.unit * 2
  },
  levels: {
    paddingTop: spacing.unit * 4,
    width: '100%',
    display: 'flex',
    flexDirection: 'row'
  },
  levelSlider: {
    flexGrow: 1,
    paddingTop: 6
  },
  levelLabel: {
    fontWeight: 'bold',
    width: spacing.unit * 12
  },
  assignmentInput: {
    marginRight: spacing.unit * 2
  },
  content: {
    padding: spacing.unit * 2,
    margin: spacing.unit
  },
  sectionTitle: {
    paddingTop: spacing.unit * 4
  },
  image: {
    position: 'relative',
    width: '100%',
    height: 320,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat'
  },
  videoTitleWrapper: {
    position: 'absolute',
    padding: `${spacing.unit}px ${spacing.unit * 3}px`,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    bottom: 0,
    right: 0,
    left: 0,
  },
  videoTitle: {
    color: 'white',
    fontWeight: 500
  },
  switchLabel: {
    paddingTop: spacing.unit * 1.5
  }
});

interface Props extends WithStyles<typeof styles> {
  video?: YoutubeVideo;
  tags: TagData[];
  loading: boolean;
  error?: string;
  onSubmit(project: ProjectCreateData): AsyncAction<ProjectGraphRecord, string>;
  onCancel(): EmptyAction;
  onNewTag(name: string): AsyncAction<TagData, string>;
}

const mapStateToProps = (state: AppState) => ({
  tags: state.tags,
  video: state.home.video,
  loading: state.home.createProjectLoading,
  error: state.home.errors.createProject
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(discardNewVideo()),
  onSubmit: (project: ProjectCreateData) =>
    createProjectThunk(project)(dispatch),
  onNewTag: (name: string) =>
    createTagThunk(name)(dispatch)
});

interface State {
  project: ProjectCreateData;
  nextAssignment: string;
}

function initState(): State {
  return {
    project: {
      videoId: '',
      title: '',
      description: '',
      objective: '',
      assignments: [],
      levelStart: 0,
      levelEnd: levelsCount - 1,
      public: false,
      collaborative: false,
      tags: [],
    },
    nextAssignment: ''
  };
}

function tagCreationSucceeded(result: Action<string | TagData>): result is Action<TagData> {
  return !result.error;
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles)(
    class extends React.Component<Props, State> {

      state = initState();

      render() {

        const { project, nextAssignment } = this.state;

        const {
          classes,
          video,
          tags,
          loading,
          error,
          onSubmit,
          onCancel,
          onNewTag
        } = this.props;

        const setProject = (modified: Partial<ProjectCreateData>) => {
          this.setState(state => ({
            ...state,
            project: {
              ...state.project,
              ...modified
            }
          }));
        };

        const featuredTags = R.filter((elem: TagData) => elem.featured)(tags);

        const displayedTags = R.union(featuredTags, project.tags);

        const isTagSelected = (tag: TagData) =>
          R.find((elem: TagData) =>
            R.equals(elem, tag)
          )(project.tags);

        const removeTag = (tag: TagData) =>
          R.filter((elem: TagData) =>
            !R.equals(elem, tag)
          )(project.tags);

        const onTagSelected = (tag: TagData) => {
          setProject({
            tags: isTagSelected(tag)
              ? removeTag(tag)
              : [...project.tags, tag]
          });
        };

        const onTagCreationRequested = (name: string) => {
          onNewTag(name)
            .then(result => {
              if (tagCreationSucceeded(result)) {
                onTagSelected(result.payload);
              }
            });
        };

        if (video) {
          return (
            <Dialog
              open={true}
              fullWidth={true}
              onClose={() => onCancel()}
              scroll="body"
            >
              <DialogHeader
                title="Nouveau projet"
                onClose={() => onCancel()}
                loading={loading}
              >
                <div
                  className={classes.image}
                  style={{
                    backgroundImage: `url(${video.thumbnailUrl})`,
                  }}
                >
                  <div className={classes.videoTitleWrapper}>
                    <Typography
                      variant="h5"
                      gutterBottom={true}
                      className={classes.videoTitle}
                    >
                      {video.title}
                    </Typography>
                  </div>
                </div>
              </DialogHeader>
              <DialogContent className={classes.content}>
                <TextField
                  margin="normal"
                  required={true}
                  label="Titre"
                  fullWidth={true}
                  helperText="Donnez un titre à votre projet"
                  onChange={event => {
                    setProject({
                      title: event.target.value
                    });
                  }}
                  value={project.title}
                />
                <TextField
                  margin="normal"
                  label="Description"
                  fullWidth={true}
                  helperText="Décrivez brièvement le contenu de la vidéo"
                  multiline={true}
                  onChange={event => {
                    setProject({
                      description: event.target.value
                    });
                  }}
                  value={project.description}
                />
                <TextField
                  margin="normal"
                  required={true}
                  label="Objectif"
                  fullWidth={true}
                  helperText="Fixez l'objectif pédagogique du projet"
                  multiline={true}
                  onChange={event => {
                    setProject({
                      objective: event.target.value
                    });
                  }}
                  value={project.objective}
                />
                <Typography variant="h6" className={classes.sectionTitle} gutterBottom={true}>
                  {`Activités proposées`}
                </Typography>
                <Typography variant="subtitle1">
                  {`Listez les différentes activités que vous proposez au partcipants`}
                </Typography>
                <List>
                  {project.assignments.map((assignment, index) =>
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={assignment} />
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={() => {
                            project.assignments.splice(index, 1);
                            setProject({
                              assignments: project.assignments
                            });
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        {project.assignments.length + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      className={classes.assignmentInput}
                      primary={
                        <TextField
                          variant="outlined"
                          placeholder="Ajouter une activité"
                          fullWidth={true}

                          value={nextAssignment}
                          onChange={event => {
                            this.setState({ nextAssignment: event.target.value });
                          }}
                        />
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => {
                          this.setState(prevState => ({
                            ...prevState,
                            project: {
                              ...prevState.project,
                              assignments: [
                                ...project.assignments,
                                nextAssignment
                              ]
                            },
                            nextAssignment: ''
                          }));
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Typography variant="h6" className={classes.sectionTitle} gutterBottom={true}>
                  {`Domaines`}
                </Typography>
                <Typography variant="subtitle1">
                  {`Choisissez un ou plusieurs domaines correspondant à votre projet`}
                </Typography>
                <div className={classes.tagList}>
                  {displayedTags.map(tag =>
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
                <TagSearchBox
                  onTagSelected={onTagSelected}
                  onTagCreationRequested={onTagCreationRequested}
                  creationEnabled={true}
                  label="Recherchez ou ajoutez un autre domaine..."
                />
                <Typography variant="h6" className={classes.sectionTitle} gutterBottom={true}>
                  {`Niveau `}
                </Typography>
                <Typography variant="subtitle1">
                  {`Veuillez préciser à quels niveaux s'adresse ce projet`}
                </Typography>
                <div className={classes.levels}>
                  <Typography align="left" className={classes.levelLabel}>
                    {levelLabel(project.levelStart)}
                  </Typography>
                  <div className={classes.levelSlider}>
                    <Range
                      min={0}
                      max={levelsCount - 1}
                      value={[project.levelStart, project.levelEnd]}
                      onChange={values => {
                        setProject({
                          levelStart: values[0],
                          levelEnd: values[1]
                        });
                      }}
                      trackStyle={sliderTrackStyle}
                      railStyle={sliderRailStyle}
                      handleStyle={[sliderHandleStyle, sliderHandleStyle]}
                      allowCross={false}
                    />
                  </div>
                  <Typography align="right" className={classes.levelLabel}>
                    {levelLabel(project.levelEnd)}
                  </Typography>
                </div>
                <Typography variant="h6" style={{ paddingTop: 36 }} gutterBottom={true}>
                  {`Partage`}
                </Typography>
                <Grid
                  container={true}
                  direction="row"
                  alignItems="flex-start"
                >
                  <Grid item={true} xs={2}>
                    <Typography

                      variant="subtitle1"
                      align="right"
                      className={classes.switchLabel}
                    >
                      {`Public`}
                    </Typography>
                  </Grid>
                  <Grid
                    item={true}
                    xs={2}
                  >
                    <Switch
                      checked={project.public}
                      onChange={(_, value) => {
                        setProject({
                          public: value
                        });
                      }}
                    />
                  </Grid>
                  <Grid item={true} xs={8}>
                    <Typography
                      gutterBottom={true}
                      className={classes.switchLabel}
                    >
                      {`Rendre un projet public signifie que tous les utilisateurs`
                        + ` de la plateforme pourront le consulter, mais ils ne pourront`
                        + ` pas y participer, ni voir les annotations`}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid
                  container={true}
                  direction="row"
                  alignItems="flex-start"
                >
                  <Grid item={true} xs={2}>
                    <Typography
                      variant="subtitle1"
                      align="right"
                      className={classes.switchLabel}
                    >
                      {`Collaboratif`}
                    </Typography>
                  </Grid>
                  <Grid
                    item={true}
                    xs={2}
                  >
                    <Switch
                      checked={project.collaborative}
                      onChange={(_, value) => {
                        setProject({
                          collaborative: value
                        });
                      }}
                    />
                  </Grid>
                  <Grid item={true} xs={8}>
                    <Typography
                      gutterBottom={true}
                      className={classes.switchLabel}
                    >
                      {`Rendre un projet collaboratif signifie que les personnes que vous`
                        + ` invitez pourront annoter la vidéo. Si le projet n’est pas `
                        + ` collaboratif, vous seul.e pourrez annoter la vidéo`}
                    </Typography>
                  </Grid>
                </Grid>
                {error && <DialogError error={error} />}
              </DialogContent>
              {loading &&
                <LinearProgress variant="query" />
              }
              <DialogActions style={{ textAlign: 'center' }}>
                <Button
                  onClick={() => onCancel()}
                  color="secondary"
                  variant="contained"
                >
                  {`Annuler`}
                </Button>
                <Button
                  onClick={() => onSubmit({ ...project, videoId: video.id })}
                  color="primary"
                  variant="contained"
                >
                  {`Enregistrer`}
                </Button>
              </DialogActions>
            </Dialog >
          );
        } else {
          return <div />;
        }
      }
    }
  )
);