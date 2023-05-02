import { AnnotationRecord, CommentRecord, UserRecord } from "@celluloid/types";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Clear";
import { Box, IconButton } from "@mui/material";
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

// const styles = (theme: Theme) =>
//   createStyles({
//     buttons: {
//       marginTop: theme.spacing.unit / 2,
//       marginRight: theme.spacing.unit * 2,
//       width: theme.spacing.unit * 8,
//     },
//     button: {
//       padding: 0,
//       width: 32,
//       height: 32,
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
//     root: {
//       transition: "all 0.15s ease",
//       minHeight: 54,
//       paddingLeft: theme.spacing.unit * 2.5,
//       display: "flex",
//       flexDirection: "row",
//       alignItems: "flex-start",
//     },
//   });

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
  const [text, setText] = useState("");

  // state = init(this.props);

  // static getDerivedStateFromProps(props: Props, state: State) {
  //   if (!props.editing) {
  //     return init(props);
  //   } else {
  //     return null;
  //   }
  // }

  if (comment && comment.text !== text) {
    setText(comment.text);
  }

  const onTextChange = (value: string) => {
    if (text === "") {
      onChange();
    }
    setText(value);
  };

  return (
    <Box
      sx={{
        transition: "all 0.15s ease",
        minHeight: 54,
        paddingLeft: 2.5,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      <UserAvatar username={user.username} userId={user.id} small />
      <Box
        sx={{
          flex: "1 1 auto",
          minWidth: 0,
          paddingY: 1,
          "&:first-child": {
            paddingLeft: 0,
          },
          margin: 0.5,
        }}
      >
        <TransparentInput
          unpadded={true}
          text={text}
          onChange={onTextChange}
          placeholder={t("annotation.commentPlaceholder") || ""}
        />
      </Box>
      <Box
        sx={(theme) => ({
          marginTop: 0.5,
          marginRight: 2,
          width: theme.spacing(8),
        })}
      >
        {comment ? (
          <>
            <IconButton
              sx={{
                padding: 0,
                width: 32,
                height: 32,
              }}
              color="secondary"
              onClick={() => onClickCancel()}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
            <IconButton
              sx={{
                padding: 0,
                width: 32,
                height: 32,
              }}
              color="primary"
              onClick={() => onClickUpdate(annotation, { ...comment, text })}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <IconButton
            sx={{
              padding: 0,
              width: 32,
              height: 32,
            }}
            color="primary"
            onClick={() => onClickAdd(annotation, text)}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CommentEditor);
