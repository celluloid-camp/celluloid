import {
  AnnotationRecord,
  CommentRecord,
  ProjectGraphRecord,
  UserRecord,
} from "@celluloid/types";
import {
  triggerCancelEditComment,
  triggerEditComment,
} from "actions/CommentActions";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Action, EmptyAction } from "types/ActionTypes";
import { AppState } from "types/StateTypes";

import CommentContent from "./CommentContent";
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  class extends React.Component<Props> {
    render() {
      const { comment, user, annotation, project, onClickCancel, onClickEdit } =
        this.props;

      const editing =
        this.props.editing &&
        this.props.focused &&
        this.props.focused.id === comment.id;

      if (editing && user) {
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
    }
  }
);
