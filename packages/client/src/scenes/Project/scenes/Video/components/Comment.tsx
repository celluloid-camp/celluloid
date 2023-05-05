import {
  AnnotationRecord,
  CommentRecord,
  ProjectGraphRecord,
  UserRecord,
} from "@celluloid/types";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  triggerCancelEditComment,
  triggerEditComment,
} from "~actions/CommentActions";
import { Action, EmptyAction } from "~types/ActionTypes";
import { AppState } from "~types/StateTypes";

import { CommentContent } from "./CommentContent";
import CommentEditor from "./CommentEditor";

interface Props {
  user?: UserRecord;
  annotation: AnnotationRecord;
  project: ProjectGraphRecord;
  comment: CommentRecord;
  editing: boolean;
  focused?: CommentRecord;
  onClickCancel(): EmptyAction;
  onClickEdit(comment: CommentRecord): Action<CommentRecord>;
}

const mapStateToProps = (state: AppState) => ({
  editing: state.project.video.commenting,
  focused: state.project.video.focusedComment,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClickCancel: () => dispatch(triggerCancelEditComment()),
  onClickEdit: (comment: CommentRecord) =>
    dispatch(triggerEditComment(comment)),
});

const Comment: React.FC<Props> = ({
  comment,
  user,
  annotation,
  project,
  onClickCancel,
  editing,
  focused,
  onClickEdit,
}) => {
  const edit = editing && focused && focused.id === comment.id;

  if (edit && user) {
    return (
      <CommentEditor
        user={user}
        annotation={annotation}
        comment={comment}
        onClickCancel={onClickCancel}
      />
    );
  } else {
    return (
      <CommentContent
        user={user}
        project={project}
        annotation={annotation}
        comment={comment}
        onClickEdit={() => onClickEdit(comment)}
      />
    );
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Comment);
