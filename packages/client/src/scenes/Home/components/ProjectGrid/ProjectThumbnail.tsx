import VisibilityChip from '@celluloid/client/src/components/VisibilityChip';
import { ProjectGraphRecord } from '@celluloid/types';
import {
  Card,
  CardContent,
  CardMedia,
  Chip,
  createStyles,
  Grid,
  Grow,
  Theme,
  Typography,
  WithStyles,
  withStyles
} from '@material-ui/core';
import PlayIcon from '@material-ui/icons/PlayCircleOutline';
import * as React from 'react';
import { Link } from 'react-router-dom';

const styles = ({ palette, spacing }: Theme) => createStyles({
  thumbnailCard: {
    height: '100%',
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

interface Props extends WithStyles<typeof styles>, ProjectGraphRecord { }

export default withStyles(styles)(({
  classes,
  id,
  videoId,
  title,
  objective,
  publishedAt,
  collaborative,
  user,
  tags,
  ...otherProps
}: Props) => (
    <Grid
      xs={12}
      sm={6}
      lg={4}
      xl={3}
      item={true}
      style={{ textAlign: 'center' }}
    >
      <Grow
        style={{ transformOrigin: '0 0 0' }}
        in={true}
        appear={true}
        key={id}
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
                <VisibilityChip
                  show={otherProps.public}
                  label="public"
                />
                <VisibilityChip
                  show={collaborative}
                  label="collaboratif"
                />
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  left: 0,
                  height: 72,
                  padding: 16,
                  backgroundColor: 'black',
                  opacity: 0.7,
                }}
              />
              <div>
                <Typography
                  variant="title"
                  style={{
                    textOverflow: 'hidden',
                    position: 'absolute',
                    zIndex: 3,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    height: 72,
                    padding: 16,
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
                  {user.username}
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
      </Grow>
    </Grid>
  ));