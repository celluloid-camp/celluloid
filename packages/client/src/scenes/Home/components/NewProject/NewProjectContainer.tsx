import 'rc-slider/assets/index.css';

import { ProjectCreateData, TagData } from '@celluloid/types';
import {
  Avatar,
  Button,
  Chip,
  createStyles,
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
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import RemoveIcon from '@material-ui/icons/Remove';
import { Range } from 'rc-slider';
import * as React from 'react';
import { connect } from 'react-redux';
import { levelLabel, levelsCount } from 'types/LevelTypes';
import { AppState } from 'types/StateTypes';
import { YoutubeVideo } from 'types/YoutubeTypes';

const styles = ({ spacing }: Theme) => createStyles({
  avatar: {
    border: '1px solid #757575',
    backgroundColor: '#fefefe'
  },
  container: {
    flexGrow: 1,
    position: 'relative' as 'relative',
  },
  suggestionsContainerOpen: {
    position: 'absolute' as 'absolute',
    marginTop: spacing.unit,
    marginBottom: spacing.unit * 3,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
});

interface Props extends WithStyles<typeof styles> {
  video?: YoutubeVideo;
  tags: TagData[];
  onClose(send: boolean, value: ProjectCreateData): Promise<{}>;
}

const mapStateToProps = (state: AppState) => ({
  tags: state.tags,
  video: state.home.video
});

export default connect(mapStateToProps)(withStyles(styles)(
  class extends React.Component<Props> {

    state = {
      videoTitle: '',
      title: '',
      description: '',
      objective: '',
      assignments: [] as string[],
      views: 0,
      shares: 0,
      levelStart: 0,
      levelEnd: levelsCount - 1,
      nextAssignment: '',
      searchTag: '',
      public: false,
      collaborative: false,
      tags: new Set<TagData>(),
      error: undefined,
      suggestions: []
    };

    render() {
      const onTagSelected = (tag: TagData) => {
        const state = this.state;
        if (state.tags.has(tag)) {
          state.tags.delete(tag);
        } else {
          state.tags.add(tag);
        }
        this.setState(state);
      };

      const { video, tags, classes } = this.props;
      if (video) {

        const onClose = (send: boolean) => (event: React.MouseEvent<HTMLElement>) => {
          const project = {
            videoId: video.id,
            title: this.state.title,
            description: this.state.description,
            objective: this.state.objective,
            assignments: this.state.assignments,
            levelStart: this.state.levelStart,
            levelEnd: this.state.levelEnd,
            tags: Array.from(this.state.tags),
            public: this.state.public,
            collaborative: this.state.collaborative
          };
          this.props.onClose(send, project)
            .then(() => {
              this.setState({
                videoTitle: '',
                title: '',
                description: '',
                objective: '',
                assignments: [] as string[],
                views: 0,
                shares: 0,
                levelStart: 0,
                levelEnd: levelsCount - 1,
                nextAssignment: '',
                searchTag: '',
                public: false,
                collaborative: false,
                tags: new Set<TagData>(),
                error: undefined,
                suggestions: []
              });
            })
            .catch(error => {
              this.setState({ error: error.message });
            });
        };



        return (
          <Dialog
            open={!!video}
            fullWidth={true}
            scroll="body"
          >
            <DialogTitle style={{ textAlign: 'center' }}>
              <span style={{ position: 'absolute', right: 16, top: 8 }}>
                <IconButton onClick={onClose(false)}><CloseIcon /></IconButton>
              </span>
              {'Nouveau projet'}
            </DialogTitle>
            <DialogContent>
              <div
                style={{
                  width: '100%',
                  height: 256,
                  backgroundImage: `url(${video.thumbnailUrl})`,
                  backgroundPosition: 'center' as 'center',
                  backgroundAttachment: 'contain' as 'contain',
                  backgroundRepeat: 'no-repeat' as 'no-repeat'
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
                  variant="title"
                  gutterBottom={true}
                >
                  {video.title}
                </Typography>
              </div>
              <TextField
                required={true}
                label=""
                fullWidth={true}
                helperText="Donnez un titre à votre projet"
                onChange={event => {
                  this.setState({ title: event.target.value });
                }}
              />
              <TextField
                label="Description"
                fullWidth={true}
                helperText="Décrivez brièvement le contenu de la vidéo"
                multiline={true}
                onChange={event => {
                  this.setState({ description: event.target.value });
                }}
              />
              <TextField
                required={true}
                label="Objectif"
                fullWidth={true}
                helperText="Fixez l'objectif pédagogique du projet"
                multiline={true}
                onChange={event => {
                  this.setState({ objective: event.target.value });
                }}
              />
              <Typography variant="title" style={{ paddingTop: 36 }} gutterBottom={true}>
                {`Activités proposées`}
              </Typography>
              <Typography variant="subheading">
                {`Listez les différentes activités que vous proposez au partcipants`}
              </Typography>
              <List>
                {this.state.assignments.map((assignment, index) =>
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
                          const assignments = this.state.assignments;
                          assignments.splice(index, 1);
                          this.setState({
                            assignments
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
                    <Avatar
                      style={{
                        border: '1px solid #757575',
                        background: '#FEFEFE',
                        color: '#757575',
                        borderRadius: '2%',
                        fontSize: '12pt',
                      }}
                    >
                      {this.state.assignments.length + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <TextField
                        label="Ajouter une activité"
                        style={{ display: 'flex', flex: 1 }}
                        value={this.state.nextAssignment}
                        onChange={event => {
                          this.setState({ nextAssignment: event.target.value });
                        }}
                      />
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => {
                        const assignments = this.state.assignments;
                        assignments.push(this.state.nextAssignment);
                        this.setState({
                          assignments,
                          nextAssignment: ''
                        });
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              <Typography variant="title" style={{ paddingTop: 36 }} gutterBottom={true}>
                {`Domaine(s)`}
              </Typography>
              <Typography variant="subheading">
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
                  this.props.tags
                    .filter(tag => tag.featured || this.state.tags.has(tag))
                    .map(tag =>
                      <Chip
                        onClick={() => {
                          const state = this.state;
                          if (state.tags.has(tag)) {
                            state.tags.delete(tag);
                          } else {
                            state.tags.add(tag);
                          }
                          this.setState(state);
                        }}
                        onDelete={
                          this.state.tags.has(tag) ?
                            () => {
                              const state = this.state;
                              if (state.tags.has(tag)) {
                                state.tags.delete(tag);
                              } else {
                                state.tags.add(tag);
                              }
                              this.setState(state);
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
              </div>
              <Typography variant="title" style={{ paddingTop: 36 }} gutterBottom={true}>
                {`Niveau `}
              </Typography>
              <Typography variant="subheading">
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
                    {levelLabel(this.state.levelStart)}
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
                    {levelLabel(this.state.levelEnd)}
                  </Typography>
                </div>
                <div style={{ paddingTop: 32 }}>
                  <Range
                    min={0}
                    max={levelsCount - 1}
                    value={[this.state.levelStart, this.state.levelEnd]}
                    onChange={values => {
                      this.setState({ levelStart: values[0], levelEnd: values[1] });
                    }}
                    trackStyle={[{ backgroundColor: 'orange' }]}
                    handleStyle={[{ borderColor: 'orange' }, { borderColor: 'orange' }]}
                    allowCross={false}
                  />
                </div>
              </div>
              <Typography variant="title" style={{ paddingTop: 36 }} gutterBottom={true}>
                {`Partage`}
              </Typography>
              <Grid
                container={true}
                direction="row"
                alignItems="flex-start"
              >
                <Grid item={true} xs={2}>
                  <Typography
                    variant="subheading"
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
                    checked={this.state.public}
                    onChange={(event, value) => {
                      this.setState({ public: value });
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
                    variant="subheading"
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
                    checked={this.state.collaborative}
                    onChange={(event, value) => {
                      this.setState({ collaborative: value });
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
                onClick={onClose(true)}
                color="primary"
                variant="raised"
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
));