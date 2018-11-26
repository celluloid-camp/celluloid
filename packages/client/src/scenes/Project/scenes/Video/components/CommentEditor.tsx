import { AppState } from 'types/StateTypes';
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
  triggerAddComment,
  updateCommentThunk
} from 'actions/CommentActions';
import UserAvatar from 'components/UserAvatar';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { AsyncAction, EmptyAction } from 'types/ActionTypes';

import TransparentInput from './TransparentInput';
import { withI18n, WithI18n } from 'react-i18next';

const styles = (theme: Theme) => createStyles({
  buttons: {
    marginTop: theme.spacing.unit / 2,
    marginRight: theme.spacing.unit * 2,
    width: theme.spacing.unit * 8
  },
  button: {
    padding: 0,
    width: 32,
    height: 32
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
  editing: boolean;
  onChange(): EmptyAction;
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

const mapStateToProps = (state: AppState) => ({
  editing: state.project.video.commenting
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onChange: () => dispatch(triggerAddComment()),
  onClickAdd: (annotation: AnnotationRecord, text: string) =>
    createCommentThunk(annotation.projectId, annotation.id, text)(dispatch),
  onClickUpdate: (annotation: AnnotationRecord, comment: CommentRecord) =>
    updateCommentThunk(annotation.projectId, annotation.id, comment)(dispatch)
});

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(
    withI18n()(
      class extends React.Component<Props & WithI18n, State> {

        state = init(this.props);

        static getDerivedStateFromProps(props: Props, state: State) {
          if (!props.editing) {
            return init(props);
          } else {
            return null;
          }
        }

        render() {
          const {
            classes,
            user,
            annotation,
            comment,
            onChange,
            onClickUpdate,
            onClickAdd,
            onClickCancel,
            t
          } = this.props;
          const { text } = this.state;

          const onTextChange = (value: string) => {
            if (this.state.text === '') {
              onChange();
            }
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
                  placeholder={t('annotation.commentPlaceholder')}
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
                        <CancelIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        className={classes.button}
                        color="primary"
                        onClick={() => onClickUpdate(annotation, { ...comment, text })}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </>
                  )
                  : (
                    <IconButton
                      className={classes.button}
                      color="primary"
                      onClick={() => onClickAdd(annotation, text)}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  )
                }
              </div>
            </div>
          );
        }
      }
    )
  )
);