import {
  AnnotationRecord,
  ProjectGraphRecord,
  UnfurlData,
} from "@celluloid/types";
import {
  Collapse,
  Fade as FadeMUI,
  Grow as GrowMUI,
  IconButton,
} from "@material-ui/core";
import CardMedia from "@material-ui/core/CardMedia";
import { FadeProps } from "@material-ui/core/Fade";
import { GrowProps } from "@material-ui/core/Grow";
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import classnames from "classnames";
import UserAvatar from "components/UserAvatar";
import * as React from "react";
import { TransitionGroup } from "react-transition-group";

import CommentsList from "../CommentsList";

const Grow: React.FC<React.PropsWithChildren & GrowProps> = (props) => (
  <GrowMUI {...props} />
);

const Fade: React.FC<React.PropsWithChildren & FadeProps> = (props) => (
  <FadeMUI {...props} />
);

const styles = ({ spacing, typography, transitions }: Theme) =>
  createStyles({
    wrapper: {
      paddingLeft: spacing.unit,
      paddingTop: spacing.unit,
      paddingBottom: spacing.unit,
    },
    annotation: {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
    },
    content: {
      flex: "1 1 auto",
      minWidth: 0,
      padding: `0 ${spacing.unit * 2}px`,
      "&:first-child": {
        paddingLeft: 0,
      },
      margin: 10,
    },
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
    fade: {
      transition: transitions.create("opacity"),
    },
    text: {
      ...typography.caption,
      "& a:any-link": {
        color: "#42a6f5",
      },
    },
    preWrap: {
      whiteSpace: "pre-wrap",
    },
    contentWrapper: {
      minHeight: 15,
    },
    media: {
      height: 0,
      paddingTop: "56.25%",
    },
    title: {
      padding: spacing.unit * 2,
    },
    card: {
      maxWidth: 320,
      cursor: "pointer",
      margin: spacing.unit,
      marginLeft: 0,
      backgroundColor: "rgba(70, 70, 70, 0.4)",
    },
    timings: {
      ...typography.caption,
      display: "inline",
    },
    actionWrapper: {
      marginTop: spacing.unit * 0.75,
      marginBottom: spacing.unit * 0.75,
      marginRight: spacing.unit * 2,
      minWidth: spacing.unit * 12,
    },
    description: {
      padding: spacing.unit * 2,
    },
  });

interface Link {
  url: string;
  data?: UnfurlData;
}

interface Props extends WithStyles<typeof styles> {
  annotation: AnnotationRecord;
  project: ProjectGraphRecord;
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

export default withStyles(styles)(
  ({
    annotation,
    project,
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
    classes,
  }: Props) => (
    <div className={classes.wrapper}>
      <div
        className={classes.annotation}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        <UserAvatar user={annotation.user} />
        <div className={classes.content} onClick={() => onFocus()}>
          <Typography>
            {`${annotation.user.username} | `}
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
              {!focused && (
                <Typography
                  className={classes.text}
                  noWrap={true}
                  gutterBottom={true}
                >
                  <span dangerouslySetInnerHTML={{ __html: richText }} />
                </Typography>
              )}
            </div>
          </Fade>
          <Collapse in={focused} appear={true}>
            <div
              className={classnames(
                classes.fade,
                focused ? classes.visible : classes.hidden
              )}
            >
              {focused && (
                <Typography
                  className={classnames(classes.text, classes.preWrap)}
                  gutterBottom={true}
                >
                  <span dangerouslySetInnerHTML={{ __html: richText }} />
                </Typography>
              )}
            </div>
          </Collapse>
          <TransitionGroup appear={true}>
            {focused &&
              previews.map(
                (preview) =>
                  preview.data && (
                    <Collapse in={true} key={preview.url} appear={true}>
                      <div
                        onClick={() => window.open(preview.url, "_blank")}
                        key={preview.url}
                        className={classes.card}
                      >
                        <div className={classes.title}>
                          <Typography variant="caption">
                            {preview.data.website}
                          </Typography>
                          <Typography variant="subtitle1">
                            {preview.data.title}
                          </Typography>
                        </div>
                        {preview.data.imageUrl && (
                          <CardMedia
                            className={classes.media}
                            image={preview.data.imageUrl}
                            title={preview.data.title}
                          />
                        )}
                        {preview.data.description && (
                          <div className={classes.description}>
                            <Typography className={classes.text}>
                              {preview.data.description}
                            </Typography>
                          </div>
                        )}
                      </div>
                    </Collapse>
                  )
              )}
          </TransitionGroup>
        </div>
        <div className={classes.actionWrapper}>
          <Grow in={showActions} appear={true}>
            <div>
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
            </div>
          </Grow>
        </div>
      </div>
      <Collapse in={focused} appear={true}>
        <CommentsList project={project} annotation={annotation} />
      </Collapse>
    </div>
  )
);
