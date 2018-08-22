import { UnfurlData, UserRecord } from '@celluloid/types';
import { Collapse, Fade, Grow, IconButton } from '@material-ui/core';
import CardMedia from '@material-ui/core/CardMedia';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import classnames from 'classnames';
import UserAvatar from 'components/UserAvatar';
import * as React from 'react';
import { TransitionGroup } from 'react-transition-group';

const styles = ({ spacing, typography, transitions, palette }: Theme) => createStyles({
  annotationWrapper: {
    paddingLeft: spacing.unit,
    paddingTop: spacing.unit,
    paddingBottom: spacing.unit,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  content: {
    flex: '1 1 auto',
    minWidth: 0,
    padding: `0 ${spacing.unit * 2}px`,
    '&:first-child': {
      paddingLeft: 0,
    },
    margin: 10,
  },
  visible: {
    opacity: 1
  },
  hidden: {
    opacity: 0,
  },
  fade: {
    transition: transitions.create('opacity')
  },
  text: {
    ...typography.caption,
    color: palette.text.disabled,
    '& a:any-link': {
      color: '#42a6f5'
    },
  },
  preWrap: {
    whiteSpace: 'pre-wrap'
  },
  contentWrapper: {
    minHeight: 15
  },
  media: {
    marginTop: spacing.unit,
    marginBottom: spacing.unit,
    height: 0,
    paddingTop: '56.25%'
  },
  title: {
    ...typography.subheading,
  },
  subheader: {
    ...typography.caption,
    color: palette.text.disabled
  },
  card: {
    maxWidth: 320,
    cursor: 'pointer',
    margin: spacing.unit,
    marginLeft: 0,
    paddingLeft: spacing.unit,
    borderLeft: `${spacing.unit / 2}px solid rgba(100, 100, 100, 0.4)`
  },
  timings: {
    ...typography.caption,
    display: 'inline'
  },
  actionZone: {
    display: 'flex',
    flexDirection: 'row',
    width: 6 + 48 + 6 + 48 + 6,
    padding: 6,
  },
  actionWrapper: {
    marginTop: 6,
    marginBottom: 6,
    marginRight: spacing.unit * 2
  },
});

interface Link {
  url: string;
  data?: UnfurlData;
}

interface Props extends WithStyles<typeof styles> {
  user: UserRecord;
  formattedStartTime: string;
  formattedStopTime: string;
  richText: string;
  loading: boolean;
  previews: Link[];
  focused: boolean;
  hovering: boolean;
  showActions: boolean;
  onFocus(): void;
  onHover(value: boolean): void;
  onClickEdit(): void;
  onClickDelete(): void;
}

export default withStyles(styles)(({
  user,
  formattedStartTime,
  formattedStopTime,
  richText,
  previews,
  focused,
  showActions,
  onFocus,
  onHover,
  onClickEdit,
  onClickDelete,
  classes
}: Props) => (
    <div
      className={classes.annotationWrapper}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <UserAvatar user={user} />
      <div
        className={classes.content}
        onClick={() => onFocus()}
      >
        <Typography>
          {`${user.username} | `}
          <span className={classes.timings}>
            {`${formattedStartTime} - ${formattedStopTime}`}
          </span>
        </Typography>
        <Fade
          in={!focused}
          appear={true}
          {...(focused ? { timeout: 1000 } : {})}
        >
          <div>
            {!focused &&
              <Typography
                className={classes.text}
                noWrap={true}
                gutterBottom={true}
              >
                <span dangerouslySetInnerHTML={{ __html: richText }} />
              </Typography>
            }
          </div>
        </Fade>
        <Collapse in={focused} appear={true} style={{ transformOrigin: 'center top' }}>
          <div className={classnames(classes.fade, focused ? classes.visible : classes.hidden)}>
            {focused &&
              <Typography
                className={classnames(classes.text, classes.preWrap)}
                gutterBottom={true}
              >
                <span dangerouslySetInnerHTML={{ __html: richText }} />
              </Typography>
            }
          </div>
        </Collapse>
        <TransitionGroup appear={true}>
          {focused && previews
            .map(preview => (
              preview.data &&
              <Collapse in={true} key={preview.url} appear={true}>
                <div
                  onClick={() => window.open(preview.url, '_blank')}
                  key={preview.url}
                  className={classes.card}
                >
                  <Typography className={classes.subheader}>
                    {preview.data.website}
                  </Typography>
                  <Typography className={classes.title}>
                    {preview.data.title}
                  </Typography>
                  {preview.data.imageUrl &&
                    <CardMedia
                      className={classes.media}
                      image={preview.data.imageUrl}
                      title={preview.data.title}
                    />
                  }
                  {preview.data.description &&
                    <Typography className={classes.text}>
                      {preview.data.description}
                    </Typography>
                  }
                </div>
              </Collapse>
            ))}
        </TransitionGroup>
      </div>
      <Grow in={showActions} appear={true}>
        <div className={classes.actionWrapper}>
          {showActions &&
            <>
              <IconButton
                color="primary"
                onClick={(event) => {
                  event.preventDefault();
                  onClickEdit();
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="secondary"
                onClick={(event) => {
                  event.preventDefault();
                  onClickDelete();
                }}
              >
                <DeleteIcon />
              </IconButton>
            </>
          }
        </div>
      </Grow>
    </div>
  ));