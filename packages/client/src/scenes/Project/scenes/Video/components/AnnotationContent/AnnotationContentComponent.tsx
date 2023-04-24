import {
  AnnotationRecord,
  ProjectGraphRecord,
  UnfurlData,
} from "@celluloid/types";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Collapse,
  Fade as FadeMUI,
  Grow as GrowMUI,
  IconButton,
} from "@mui/material";
import CardMedia from "@mui/material/CardMedia";
import { FadeProps } from "@mui/material/Fade";
import { GrowProps } from "@mui/material/Grow";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { TransitionGroup } from "react-transition-group";

import UserAvatar from "~components/UserAvatar";

import CommentsList from "../CommentsList";

const Grow: React.FC<React.PropsWithChildren & GrowProps> = (props) => (
  <GrowMUI {...props} />
);

const Fade: React.FC<React.PropsWithChildren & FadeProps> = (props) => (
  <FadeMUI {...props} />
);

// const styles = ({ spacing, typography, transitions }: Theme) =>
//   createStyles({
//     wrapper: {
//       paddingLeft: spacing.unit,
//       paddingTop: spacing.unit,
//       paddingBottom: spacing.unit,
//     },
//     annotation: {
//       display: "flex",
//       flexDirection: "row",
//       alignItems: "flex-start",
//     },
//     content: {
//       flex: "1 1 auto",
//       minWidth: 0,
//       padding: `0 ${spacing.unit * 2}px`,
//       "&:first-child": {
//         paddingLeft: 0,
//       },
//       margin: 10,
//     },
//     visible: {
//       opacity: 1,
//     },
//     hidden: {
//       opacity: 0,
//     },
//     fade: {
//       transition: transitions.create("opacity"),
//     },
//     text: {
//       ...typography.caption,
//       "& a:any-link": {
//         color: "#42a6f5",
//       },
//     },
//     preWrap: {
//       whiteSpace: "pre-wrap",
//     },
//     contentWrapper: {
//       minHeight: 15,
//     },
//     media: {
//       height: 0,
//       paddingTop: "56.25%",
//     },
//     title: {
//       padding: spacing.unit * 2,
//     },
//     card: {
//       maxWidth: 320,
//       cursor: "pointer",
//       margin: spacing.unit,
//       marginLeft: 0,
//       backgroundColor: "rgba(70, 70, 70, 0.4)",
//     },
//     timings: {
//       ...typography.caption,
//       display: "inline",
//     },
//     actionWrapper: {
//       marginTop: spacing.unit * 0.75,
//       marginBottom: spacing.unit * 0.75,
//       marginRight: spacing.unit * 2,
//       minWidth: spacing.unit * 12,
//     },
//     description: {
//       padding: spacing.unit * 2,
//     },
//   });

interface Link {
  url: string;
  data?: UnfurlData;
}

interface Props {
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

export default ({
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
}: Props) => (
  <Box
    sx={(_theme) => ({
      paddingLeft: 1,
      paddingTop: 1,
      paddingBottom: 1,
    })}
  >
    <Box
      flexDirection={"row"}
      alignItems={"flex-start"}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <UserAvatar user={annotation.user} />
      <Box
        sx={(theme) => ({
          flex: "1 1 auto",
          minWidth: 0,
          padding: `0 ${theme.spacing(2)}px`,
          "&:first-child": {
            paddingLeft: 0,
          },
          margin: 10,
        })}
        onClick={() => onFocus()}
      >
        <Typography>
          {`${annotation.user.username} | `}
          <Box
            component={"span"}
            sx={{
              display: "inline",
            }}
          >
            {`${formattedStartTime} - ${formattedStopTime}`}
          </Box>
        </Typography>
        <Fade
          in={!focused}
          appear={true}
          {...(focused ? { timeout: 1000 } : {})}
        >
          <div>
            {!focused && (
              <Typography
                sx={{
                  "& a:any-link": {
                    color: "#42a6f5",
                  },
                }}
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
          // className={classnames(
          //   classes.fade,
          //   focused ? classes.visible : classes.hidden
          // )}
          >
            {focused && (
              <Typography
                // className={classnames(classes.text, classes.preWrap)}
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
                    <Box
                      onClick={() => window.open(preview.url, "_blank")}
                      key={preview.url}
                      sx={{
                        maxWidth: 320,
                        cursor: "pointer",
                        margin: 1,
                        marginLeft: 0,
                        backgroundColor: "rgba(70, 70, 70, 0.4)",
                      }}
                    >
                      <Box
                        sx={{
                          padding: 1,
                        }}
                      >
                        <Typography variant="caption">
                          {preview.data.website}
                        </Typography>
                        <Typography variant="subtitle1">
                          {preview.data.title}
                        </Typography>
                      </Box>
                      {preview.data.imageUrl && (
                        <CardMedia
                          sx={{
                            height: 0,
                            paddingTop: "56.25%",
                          }}
                          image={preview.data.imageUrl}
                          title={preview.data.title}
                        />
                      )}
                      {preview.data.description && (
                        <Box
                          sx={{
                            padding: 2,
                          }}
                        >
                          <Typography
                            sx={{
                              "& a:any-link": {
                                color: "#42a6f5",
                              },
                            }}
                          >
                            {preview.data.description}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                )
            )}
        </TransitionGroup>
      </Box>
      <Box
        sx={(theme) => ({
          marginTop: 0.75,
          marginBottom: 0.75,
          marginRight: 2,
          minWidth: theme.spacing(12),
        })}
      >
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
      </Box>
    </Box>
    <Collapse in={focused} appear={true}>
      <CommentsList project={project} annotation={annotation} />
    </Collapse>
  </Box>
);
