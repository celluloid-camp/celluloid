import { AnnotationRecord, CommentRecord, UserRecord } from "@celluloid/types";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Clear";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  ClickAwayListener,
  IconButton,
  InputAdornment,
  Stack,
} from "@mui/material";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  createCommentThunk,
  triggerAddComment,
  updateCommentThunk,
} from "~actions/CommentActions";
import { UserAvatar } from "~components/UserAvatar";
import { AsyncAction, EmptyAction } from "~types/ActionTypes";
import { AppState } from "~types/StateTypes";

import TransparentInput from "./TransparentInput";

interface Props {
  user: UserRecord;
  annotation: AnnotationRecord;
  comment?: CommentRecord;
  editing: boolean;
  onChange(): EmptyAction;
  onClickAdd(
    annotation: AnnotationRecord,
    text: string
  ): AsyncAction<CommentRecord, string>;
  onClickUpdate(
    annotation: AnnotationRecord,
    comment: CommentRecord
  ): AsyncAction<CommentRecord, string>;
  onClickCancel(): void;
}

// interface State {
//   text: string;
// }

export const _init = ({ comment }: Props) => {
  if (comment) {
    return { text: comment.text };
  } else {
    return { text: "" };
  }
};

const mapStateToProps = (state: AppState) => ({
  editing: state.project.video.commenting,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onChange: () => dispatch(triggerAddComment()),
  onClickAdd: (annotation: AnnotationRecord, text: string) =>
    createCommentThunk(annotation.projectId, annotation.id, text)(dispatch),
  onClickUpdate: (annotation: AnnotationRecord, comment: CommentRecord) =>
    updateCommentThunk(annotation.projectId, annotation.id, comment)(dispatch),
});

const CommentEditor: React.FC<Props> = ({
  user,
  annotation,
  comment,
  onChange,
  onClickUpdate,
  onClickAdd,
  onClickCancel,
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState(comment?.text || "");

  const onTextChange = (value: string) => {
    if (text === "") {
      onChange();
    }
    setText(value);
  };

  return (
    <ClickAwayListener onClickAway={onClickCancel}>
      <Box
        sx={{
          transition: "all 0.15s ease",
          minHeight: 54,
          paddingLeft: 2,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
        }}
      >
        <UserAvatar username={user.username} userId={user.id} small />
        <Box flex={1} marginLeft={1}>
          <TransparentInput
            unpadded={true}
            value={text}
            onChange={onTextChange}
            placeholder={t("annotation.commentPlaceholder") || ""}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="Send"
                  onClick={() =>
                    comment
                      ? onClickUpdate(annotation, { ...comment, text })
                      : onClickAdd(annotation, text)
                  }
                  edge="end"
                  color="success"
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </Box>
        <Box
          sx={(theme) => ({
            marginRight: 2,
            width: theme.spacing(2),
          })}
        >
          {comment ? (
            <Stack direction={"row"}>
              <IconButton color="secondary" onClick={() => onClickCancel()}>
                <CancelIcon fontSize="small" />
              </IconButton>
              <IconButton
                color="primary"
                onClick={() => onClickUpdate(annotation, { ...comment, text })}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </Stack>
          ) : null}
        </Box>
      </Box>
    </ClickAwayListener>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CommentEditor);
