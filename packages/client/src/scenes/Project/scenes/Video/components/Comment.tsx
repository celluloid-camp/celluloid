import {
  AnnotationRecord,
  CommentRecord,
  UserRecord
} from '@celluloid/types';
import * as React from 'react';

import CommentContent from './CommentContent';
import CommentEditor from './CommentEditor';

interface State {
  editing: boolean;
}

interface Props {
  user?: UserRecord;
  annotation: AnnotationRecord;
  comment: CommentRecord;
}

export default (
  class extends React.Component<Props, State> {
    state = {
      editing: false
    };

    render() {
      const { comment, user, annotation } = this.props;
      const { editing } = this.state;

      const onClickEdit = () => {
        this.setState({ editing: true });
      };

      const onClickCancel = () => {
        this.setState({ editing: false });
      };

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
            annotation={annotation}
            comment={comment}
            onClickEdit={onClickEdit}
          />
        );
      }
    }
  });