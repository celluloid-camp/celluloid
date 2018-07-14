import * as React from 'react';

import { withStyles, createStyles, WithStyles, Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
// import Button from '@material-ui/core/IconButton';

import PlayIcon from '@material-ui/icons/PlayCircleOutline';
import { DisplayProjectData } from '../../common/src/types/Project';

const styles = ({ palette, spacing }: Theme) => createStyles({
  '@keyframes fade-card-in': {
    from: {
      opacity: 0,
      transform: 'scale(0.0)'
    },
    to: {
      opacity: 1,
      transform: 'scale(1.0)'
    }
  },
  thumbnailCard: {
    height: '100%',
    animation: 'fade-card-in 0.5s ease-out 0s 1',
    transition: 'all 1s ease'
  },
  thumbnailImage: {
    height: '196px',
    textAlign: 'center' as 'center',
    padding: spacing.unit * 6,
  },
  visibilityContainer: {
    display: 'flex' as 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'flex-start' as 'flex-start',
    alignItems: 'flex-end' as 'flex-end',
    position: 'absolute' as 'absolute',
    right: 0,
    top: 0,
    padding: spacing.unit,
  },
  visibilityChip: {
    backgroundColor: palette.secondary.dark,
    color: 'white',
    margin: spacing.unit
  }
});

interface Props extends WithStyles<typeof styles>, DisplayProjectData { }

const ProjectThumbnail = withStyles(styles)(
  class extends React.Component<Props> {
    render() {
      const {
        id,
        classes,
        videoId,
        title,
        objective,
        publishedAt,
        author,
        tags
      } = this.props;
      return (
        <Grid
          xs={12}
          sm={6}
          lg={4}
          xl={3}
          item={true}
          style={{ textAlign: 'center' }}
        >
          <Card className={classes.thumbnailCard}>
            <Link
              to={`/projects/${id}`}
            >
              <CardMedia
                image={`https://img.youtube.com/vi/${videoId}/0.jpg`}
                className={classes.thumbnailImage}
                style={{ position: 'relative' }}
              >
                <div
                  style={{
                    position: 'relative',
                    top: 0,
                    left: 0,
                    right: 0
                  }}
                >
                  <PlayIcon style={{ width: 56, height: 56, color: 'white' }} />
                </div>
                <div className={classes.visibilityContainer}>
                  {this.props.public &&
                    <Chip
                      className={classes.visibilityChip}
                      label="public"
                    />
                  }
                  {this.props.collaborative &&
                    <Chip
                      className={classes.visibilityChip}
                      label="collaboratif"
                    />
                  }
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    left: 0,
                    height: 48,
                    padding: 16,
                    backgroundColor: 'black',
                    opacity: 0.7,
                  }}
                />
                <div>
                  <Typography
                    variant="title"
                    style={{
                      position: 'absolute',
                      zIndex: 3,
                      bottom: 0,
                      right: 0,
                      left: 0,
                      height: 48,
                      padding: 20,
                      color: 'white',
                    }}
                  >
                    <b>{title}</b>
                  </Typography>
                </div>
              </CardMedia>
            </Link>
            <CardContent>
              <Grid
                container={true}
                direction="column"
                justify="space-between"
                alignItems="stretch"
                style={{
                  height: '100%'
                }}
              >
                <Grid item={true} xs={12}>
                  <Typography variant="subheading" gutterBottom={true}>
                    <b>{objective}</b>
                  </Typography>
                </Grid>
                <Grid item={true} xs={12}>
                  <Typography style={{ paddingTop: 24 }}>
                    {author.username}
                  </Typography>
                  <Typography variant="caption">
                    {new Date(publishedAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item={true} xs={12}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      paddingTop: 24,
                    }}
                  >
                    {tags.map((tag, index) =>
                      <Chip
                        key={index}
                        label={tag.name}
                        style={{
                          margin: 4,
                        }}
                      />
                    )}
                  </div>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      );
    }
  }
);

interface GridProps {
  projects: DisplayProjectData[];
}

const ProjectGrid = class extends React.Component<GridProps> {

  constructor(props: GridProps & { classes: { thumbnailCard: string; thumbnailImage: string; } }) {
    super(props);
    this.state = {
      projects: [] as DisplayProjectData[],
      error: undefined
    };
  }

  render() {
    return (
      <div style={{ padding: 20 }}>
        <Grid
          container={true}
          spacing={40}
          direction="row"
        >
          {
            this.props.projects.map((project: DisplayProjectData, idx) =>
              <ProjectThumbnail
                key={project.id}
                {...project}
              />
            )
          }
        </Grid>
      </div>
    );
  }
};

export default ProjectGrid;