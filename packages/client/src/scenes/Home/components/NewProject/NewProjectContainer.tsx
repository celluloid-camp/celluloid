import 'rc-slider/assets/index.css';

import { createProjectThunk } from '@celluloid/client/src/actions/ProjectActions';
import { AsyncAction, EmptyAction } from '@celluloid/client/src/types/ActionTypes';
import { ProjectCreateData, ProjectGraphRecord, TagData } from '@celluloid/types';
import {
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
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

interface Props {
  video?: YoutubeVideo;
  tags: TagData[];
  onSubmit(project: ProjectCreateData): AsyncAction<ProjectGraphRecord, string>;
  onCancel(): EmptyAction;
}

const mapStateToProps = (state: AppState) => ({
  tags: state.tags,
  video: state.home.video
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCancel: () => dispatch(discardNewVideo()),
  onSubmit: (project: ProjectCreateData) =>
    createProjectThunk(project)(dispatch)
});

interface State {
  project: ProjectCreateData;
  error?: string;
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
    nextAssignment: '',
    error: undefined,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  class extends React.Component<Props, State> {

    state = initState();

    render() {

      const { project, nextAssignment } = this.state;

      const { video, tags, onSubmit, onCancel } = this.props;

      const tagSelection = new Set<TagData>(project.tags);

      const onTagSelected = (tag: TagData) => {

        if (tagSelection.has(tag)) {
          tagSelection.delete(tag);
        } else {
          tagSelection.add(tag);
        }
        this.setState(prevState => ({
          ...prevState,
          project: {
            ...prevState.project,
            tags: Array.from(tagSelection),
          }
        }));
      };

      if (video) {

        return (
          <Dialog
            open={true}
            fullWidth={true}
            onClose={() => onCancel()}
            scroll="body"
          >
            <DialogTitle style={{ textAlign: 'center' }}>
              <span style={{ position: 'absolute', right: 16, top: 8 }}>
                <IconButton
                  onClick={() => onCancel()}
                >
                  <CloseIcon />
                </IconButton>
              </span>
              {'Nouveau projet'}
            </DialogTitle>
            <DialogContent>
              <div
                style={{
                  width: '100%',
                  height: 256,
                  backgroundImage: `url(${video.thumbnailUrl})`,
                  backgroundPosition: 'center',
                  backgroundAttachment: 'contain',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div
                style={{
                  justifyContent: 'center',
                  padding: 16,
                  display: 'flex',
                  flexWrap: 'wrap'
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom={true}
                >
                  {video.title}
                </Typography>
              </div>
              <TextField
                required={true}
                label="Titre"
                fullWidth={true}
                helperText="Donnez un titre à votre projet"
                onChange={event => {
                  const value = event.target.value;
                  this.setState(prevState => ({
                    ...prevState,
                    project: {
                      ...prevState.project,
                      title: value
                    }
                  }));
                }}
                value={project.title}
              />
              <TextField
                label="Description"
                fullWidth={true}
                helperText="Décrivez brièvement le contenu de la vidéo"
                multiline={true}
                onChange={event => {
                  const value = event.target.value;
                  this.setState(prevState => ({
                    ...prevState,
                    project: {
                      ...prevState.project,
                      description: value
                    }
                  }));
                }}
                value={project.description}
              />
              <TextField
                required={true}
                label="Objectif"
                fullWidth={true}
                helperText="Fixez l'objectif pédagogique du projet"
                multiline={true}
                onChange={event => {
                  const value = event.target.value;
                  this.setState(prevState => ({
                    ...prevState,
                    project: {
                      ...prevState.project,
                      objective: value
                    }
                  }));
                }}
                value={project.objective}
              />
              <Typography variant="h6" style={{ paddingTop: 36 }} gutterBottom={true}>
                {`Activités proposées`}
              </Typography>
              <Typography variant="subtitle1">
                {`Listez les différentes activités que vous proposez au partcipants`}
              </Typography>
              <List>
                {project.assignments.map((assignment, index) =>
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar
                        style={{
                          borderRadius: '2%',
                          fontSize: '12pt',
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={assignment} />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => {
                          project.assignments.splice(index, 1);
                          this.setState(prevState => ({
                            ...prevState,
                            project: {
                              ...prevState.project,
                              assignments: project.assignments
                            }
                          }));
                        }}
                      >
                        <RemoveIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                )}
                <ListItem>
                  <ListItemAvatar>
                    <Avatar
                      style={{
                        border: '1px solid #757575',
                        background: '#FEFEFE',
                        color: '#757575',
                        borderRadius: '2%',
                        fontSize: '12pt',
                      }}
                    >
                      {project.assignments.length + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <TextField
                        label="Ajouter une activité"
                        style={{ display: 'flex', flex: 1 }}
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
              <Typography variant="h6" style={{ paddingTop: 36 }} gutterBottom={true}>
                {`Domaine(s)`}
              </Typography>
              <Typography variant="subtitle1">
                {`Choisissez un ou plusieurs domaine(s) correspondant à votre projet`}
              </Typography>
              <div
                style={{
                  justifyContent: 'center',
                  padding: 16,
                  display: 'flex',
                  flexWrap: 'wrap'
                }}
              >
                {
                  tags
                    .filter(tag => tag.featured || tagSelection.has(tag))
                    .map(tag =>
                      <Chip
                        onClick={() => {
                          if (tagSelection.has(tag)) {
                            tagSelection.delete(tag);
                          } else {
                            tagSelection.add(tag);
                          }
                          this.setState(prevState => ({
                            ...prevState,
                            project: {
                              ...prevState.project,
                              tags: Array.from(tagSelection)
                            }
                          }));
                        }}
                        onDelete={
                          tagSelection.has(tag) ?
                            () => {
                              if (tagSelection.has(tag)) {
                                tagSelection.delete(tag);
                              } else {
                                tagSelection.add(tag);
                              }
                              this.setState(prevState => ({
                                ...prevState,
                                project: {
                                  ...prevState.project,
                                  tags: Array.from(tagSelection)
                                }
                              }));
                            } : undefined
                        }
                        key={tag.id}
                        label={tag.name}
                        style={{
                          margin: 4
                        }}
                      />
                    )
                }
              </div>
              <div
                style={{
                  justifyContent: 'center',
                  display: 'flex',
                  flexWrap: 'wrap'
                }}
              >
                <Typography>
                  Ou bien recherchez ou ajoutez un domaine
              </Typography>
              </div>
              <div
                style={{
                  justifyContent: 'center',
                  display: 'flex',
                  flexWrap: 'wrap'
                }}
              >
                <TagSearchBox
                  tags={this.props.tags}
                  onTagSelected={onTagSelected}
                />
              </div>
              <Typography variant="h6" style={{ paddingTop: 36 }} gutterBottom={true}>
                {`Niveau `}
              </Typography>
              <Typography variant="subtitle1">
                {`Veuillez préciser à quel(s) niveau(x) s'adresse ce projet`}
              </Typography>
              <div
                style={{
                  padding: '16px 72px',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    textAlign: 'center',
                    width: 72,
                    marginLeft: 36,
                    left: 0
                  }}
                >
                  <Typography
                    variant="caption"
                    style={{ textAlign: 'center' }}
                  >
                    {levelLabel(project.levelStart)}
                  </Typography>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    textAlign: 'center',
                    width: 72,
                    marginRight: 36,
                    right: 0
                  }}
                >
                  <Typography
                    variant="caption"
                    style={{ textAlign: 'center' }}
                  >
                    {levelLabel(project.levelEnd)}
                  </Typography>
                </div>
                <div style={{ paddingTop: 32 }}>
                  <Range
                    min={0}
                    max={levelsCount - 1}
                    value={[project.levelStart, project.levelEnd]}
                    onChange={values => {
                      this.setState(prevState => ({
                        ...prevState,
                        project: {
                          ...prevState.project,
                          levelStart: values[0],
                          levelEnd: values[1]
                        }
                      }));
                    }}
                    trackStyle={[{ backgroundColor: 'orange' }]}
                    handleStyle={[{ borderColor: 'orange' }, { borderColor: 'orange' }]}
                    allowCross={false}
                  />
                </div>
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
                    style={{ paddingTop: 12, textAlign: 'right' }}
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
                      this.setState(prevState => ({
                        ...prevState,
                        project: {
                          ...prevState.project,
                          public: value
                        }
                      }));
                    }}
                  />
                </Grid>
                <Grid item={true} xs={8}>
                  <Typography
                    gutterBottom={true}
                    style={{ paddingTop: 12 }}
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
                    style={{ paddingTop: 12, textAlign: 'right' }}
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
                      this.setState(prevState => ({
                        ...prevState,
                        project: {
                          ...prevState.project,
                          collaborative: value,
                        }
                      }));
                    }}
                  />
                </Grid>
                <Grid item={true} xs={8}>
                  <Typography
                    gutterBottom={true}
                    style={{ paddingTop: 12 }}
                  >
                    {`Rendre un projet collaboratif signifie que les personnes que vous`
                      + ` invitez pourront annoter la vidéo. Si le projet n’est pas `
                      + ` collaboratif, vous seul.e pourrez annoter la vidéo`}
                  </Typography>
                </Grid>
              </Grid>
              {this.state.error &&
                <Typography
                  style={{ padding: 24, color: 'red', textAlign: 'center' }}
                >
                  {this.state.error}
                </Typography>
              }
            </DialogContent>
            <DialogActions style={{ textAlign: 'center' }}>
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
);