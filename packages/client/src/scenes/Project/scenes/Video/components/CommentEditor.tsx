import {
  AnnotationRecord,
  CommentRecord,
  UserRecord
} from '@celluloid/types';
import {
  createStyles,
  IconButton,
  Theme,
  WithStyles,
  withStyles
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import CancelIcon from '@material-ui/icons/Clear';
import {
  createCommentThunk,
  updateCommentThunk
} from 'actions/CommentActions';
import UserAvatar from 'components/UserAvatar';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { AsyncAction } from 'types/ActionTypes';

import TransparentInput from './TransparentInput';

const styles = (theme: Theme) => createStyles({
  buttons: {
    marginTop: theme.spacing.unit / 2,
    marginRight: theme.spacing.unit * 2,
    width: theme.spacing.unit * 8
  },
  button: {
    width: 32,
    height: 32
  },
  icon: {
    fontSize: 20
  },
  content: {
    flex: '1 1 auto',
    minWidth: 0,
    padding: `0 ${theme.spacing.unit}px`,
    '&:first-child': {
      paddingLeft: 0,
    },
    margin: theme.spacing.unit / 2,
  },
  root: {
    transition: 'all 0.15s ease',
    minHeight: 54,
    paddingLeft: theme.spacing.unit * 2.5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});

interface Props extends WithStyles<typeof styles> {
  user: UserRecord;
  annotation: AnnotationRecord;
  comment?: CommentRecord;
  onClickAdd(annotation: AnnotationRecord, text: string):
    AsyncAction<CommentRecord, string>;
  onClickUpdate(annotation: AnnotationRecord, comment: CommentRecord):
    AsyncAction<CommentRecord, string>;
  onClickCancel(): void;
}

interface State {
  text: string;
}

const init = ({ comment }: Props) => {
  if (comment) {
    return { text: comment.text };
  } else {
    return { text: '' };
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClickAdd: (annotation: AnnotationRecord, text: string) =>
    createCommentThunk(annotation.projectId, annotation.id, text)(dispatch),
  onClickUpdate: (annotation: AnnotationRecord, comment: CommentRecord) =>
    updateCommentThunk(annotation.projectId, annotation.id, comment)(dispatch)
});

export default connect(null, mapDispatchToProps)(
  withStyles(styles)(
    class extends React.Component<Props, State> {

      state = init(this.props);

      render() {
        const {
          classes,
          user,
          annotation,
          comment,
          onClickUpdate,
          onClickAdd,
          onClickCancel
        } = this.props;
        const { text } = this.state;

        const onTextChange = (value: string) => {
          this.setState({
            text: value
          });
        };

        return (
          <div className={classes.root}>
            <UserAvatar user={user} small={true} />
            <div className={classes.content}>
              <TransparentInput
                unpadded={true}
                text={text}
                onChange={onTextChange}
                placeholder="Laissez un commentaire…"
              />
            </div>
            <div className={classes.buttons}>
              {comment
                ? (
                  <>
                    <IconButton
                      className={classes.button}
                      color="secondary"
                      onClick={() => onClickCancel()}
                    >
                      <CancelIcon
                        className={classes.icon}
                      />
                    </IconButton>
                    <IconButton
                      className={classes.button}
                      color="primary"
                      onClick={() => onClickUpdate(annotation, {...comment, text })}
                    >
                      <CheckIcon
                        className={classes.icon}
                      />
                    </IconButton>
                  </>
                )
                : (
                  <IconButton
                    className={classes.button}
                    color="primary"
                    onClick={() => onClickAdd(annotation, text)}
                  >
                    <AddIcon
                      className={classes.icon}
                    />
                  </IconButton>
                )
              }
            </div>
          </div>
        );
      }
    }
  )
);