import {
  AnnotationRecord,
  CommentRecord,
  ProjectGraphRecord,
  UserRecord,
} from "@celluloid/types";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Grow, IconButton, Typography } from "@mui/material";
import moment from "moment";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { deleteCommentThunk } from "~actions/CommentActions";
import { UserAvatar } from "~components/UserAvatar";
import { AsyncAction } from "~types/ActionTypes";
import { canEditComment } from "~utils/AnnotationUtils";
import { isOwner } from "~utils/ProjectUtils";

// const styles = (theme: Theme) =>
//   createStyles({
//     root: {
//       transition: "all 0.15s ease",
//       minHeight: 54,
//       paddingLeft: theme.spacing.unit * 2.5,
//       display: "flex",
//       flexDirection: "row",
//       alignItems: "flex-start",
//       paddingBottom: theme.spacing.unit,
//     },
//     text: {
//       ...theme.typography.caption,
//       color: theme.palette.text.disabled,
//       "& a:any-link": {
//         color: "#42a6f5",
//       },
//       whiteSpace: "pre-wrap",
//     },
//     content: {
//       flex: "1 1 auto",
//       minWidth: 0,
//       padding: `0 ${theme.spacing.unit}px`,
//       "&:first-child": {
//         paddingLeft: 0,
//       },
//       margin: theme.spacing.unit / 2,
//     },
//     buttons: {
//       width: theme.spacing.unit * 8,
//       marginTop: theme.spacing.unit / 2,
//       marginRight: theme.spacing.unit * 2,
//     },
//     button: {
//       width: theme.spacing.unit * 4,
//       height: theme.spacing.unit * 4,
//     },
//     icon: {
//       fontSize: theme.spacing.unit * 2.5,
//     },
//   });

interface State {
  hovering: boolean;
}

interface Props {
  user?: UserRecord;
  project: ProjectGraphRecord;
  comment: CommentRecord;
  annotation: AnnotationRecord;
  onClickEdit(): void;
  onClickDelete(
    projectId: string,
    annotationId: string,
    comment: CommentRecord
  ): AsyncAction<CommentRecord, string>;
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClickDelete: (
    projectId: string,
    annotationId: string,
    comment: CommentRecord
  ) => deleteCommentThunk(projectId, annotationId, comment)(dispatch),
});

const CommentContent = connect(
  null,
  mapDispatchToProps
)(
  class extends React.Component<Props, State> {
    state = {
      hovering: false,
    };

    render() {
      const { user, project, comment, annotation, onClickEdit, onClickDelete } =
        this.props;

      const { hovering } = this.state;
      const showActions =
        user &&
        (canEditComment(comment, user) || isOwner(project, user)) &&
        hovering;

      const onHover = (hoverChange: boolean) => {
        this.setState({ hovering: hoverChange });
      };

      return (
        <Box
          sx={(theme) => ({
            minHeight: 54,
            paddingLeft: theme.spacing(2.5),
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            paddingBottom: theme.spacing(1),
          })}
          onMouseEnter={() => onHover(true)}
          onMouseLeave={() => onHover(false)}
        >
          <UserAvatar
            username={comment.user.username}
            id={comment.user.id}
            small
          />
          <Box
            sx={(theme) => ({
              flex: "1 1 auto",
              minWidth: 0,
              padding: `0 ${theme.spacing(1)}px`,
              "&:first-child": {
                paddingLeft: 0,
              },
              margin: 0.5,
            })}
          >
            <Typography variant="caption">
              {`${comment.user.username} | ${moment(
                comment.createdAt
              ).fromNow()}`}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                "& a:any-link": {
                  color: "#42a6f5",
                },
                whiteSpace: "pre-wrap",
              }}
              noWrap={true}
              gutterBottom={true}
            >
              {comment.text}
            </Typography>
          </Box>
          <Grow in={showActions} appear={true}>
            <Box
              sx={(theme) => ({
                width: theme.spacing(8),
                marginTop: 0.5,
                marginRight: 2,
              })}
            >
              {showActions && (
                <>
                  <IconButton
                    sx={(theme) => ({
                      width: theme.spacing(4),
                      height: theme.spacing(4),
                    })}
                    onClick={() => onClickEdit()}
                  >
                    <EditIcon color="disabled" />
                  </IconButton>
                  <IconButton
                    sx={(theme) => ({
                      width: theme.spacing(4),
                      height: theme.spacing(4),
                    })}
                    onClick={() =>
                      onClickDelete(
                        annotation.projectId,
                        annotation.id,
                        comment
                      )
                    }
                  >
                    <DeleteIcon color="disabled" />
                  </IconButton>
                </>
              )}
            </Box>
          </Grow>
        </Box>
      );
    }
  }
);

export default CommentContent;
