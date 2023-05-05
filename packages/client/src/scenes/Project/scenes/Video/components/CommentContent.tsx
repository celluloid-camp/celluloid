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
import React, { useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { deleteCommentThunk } from "~actions/CommentActions";
import { UserAvatar } from "~components/UserAvatar";
import { AsyncAction } from "~types/ActionTypes";
import { canEditComment } from "~utils/AnnotationUtils";
import { isOwner } from "~utils/ProjectUtils";

interface Props {
  user?: UserRecord;
  project: ProjectGraphRecord;
  comment: CommentRecord;
  annotation: AnnotationRecord;
  onClickEdit(): void;
  onClickDelete?(
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

const CommentContentWrapper: React.FC<Props> = ({
  user,
  project,
  comment,
  annotation,
  onClickEdit,
  onClickDelete,
}) => {
  const [hovering, setHovering] = useState(false);

  const showActions =
    user &&
    (canEditComment(comment, user) || isOwner(project, user)) &&
    hovering;

  const onHover = (hoverChange: boolean) => {
    setHovering(hoverChange);
  };

  return (
    <Box
      sx={{
        minHeight: 54,
        paddingLeft: 2,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        paddingBottom: 1,
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <UserAvatar
        username={comment.user.username}
        userId={comment.user.id}
        small
      />
      <Box flex={1} display={"flex"} flexDirection={"column"} marginLeft={1}>
        <Typography variant="caption">
          {`${comment.user.username} | ${moment(comment.createdAt).fromNow()}`}
        </Typography>
        <Typography
          variant="caption"
          color="neutral.400"
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
          sx={{
            marginTop: 0.5,
            marginRight: 2,
          }}
        >
          {showActions && (
            <>
              <IconButton size="small" onClick={() => onClickEdit()}>
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() =>
                  onClickDelete &&
                  onClickDelete(annotation.projectId, annotation.id, comment)
                }
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Grow>
    </Box>
  );
};

export const CommentContent = connect(
  null,
  mapDispatchToProps
)(CommentContentWrapper);
