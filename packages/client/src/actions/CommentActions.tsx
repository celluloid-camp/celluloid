import { CommentRecord } from '@celluloid/types';
import { Dispatch } from 'redux';
import CommentService from 'services/CommentService';
import {
  ActionType,
  AsyncAction,
  createAction,
  createErrorAction
} from 'types/ActionTypes';

export const triggerUpsertCommentLoading = (comment?: CommentRecord) =>
  createAction(ActionType.TRIGGER_UPSERT_COMMENT_LOADING, comment);

export const failUpsertComment = (error: string) =>
  createErrorAction(ActionType.FAIL_UPSERT_COMMENT, error);

export const succeedAddComment = (comment: CommentRecord) =>
  createAction(ActionType.SUCCEED_ADD_COMMENT, comment);

export const succeedUpdateComment = (comment: CommentRecord) =>
  createAction(ActionType.SUCCEED_UPDATE_COMMENT, comment);

export const triggerDeleteCommentLoading = (comment: CommentRecord) =>
  createAction(ActionType.TRIGGER_DELETE_COMMENT_LOADING, comment);

export const failDeleteComment = (error: string) =>
  createErrorAction(ActionType.FAIL_DELETE_COMMENT, error);

export const succeedDeleteComment = (comment: CommentRecord) =>
  createAction(ActionType.SUCCEED_DELETE_COMMENT, comment);

export const deleteCommentThunk =
  (projectId: string, annotationId: string, comment: CommentRecord) =>
    (dispatch: Dispatch): AsyncAction<CommentRecord, string> => {
      dispatch(triggerDeleteCommentLoading(comment));
      return CommentService.delete(projectId, annotationId, comment.id)
        .then(() => dispatch(succeedDeleteComment(comment)))
        .catch(error => dispatch(failDeleteComment(error)));
    };

export const createCommentThunk =
  (projectId: string, annotationId: string, comment: string) =>
    (dispatch: Dispatch): AsyncAction<CommentRecord, string> => {
      dispatch(triggerUpsertCommentLoading());
      return CommentService.create(projectId, annotationId, comment)
        .then(created => dispatch(succeedAddComment(created)))
        .catch(error => dispatch(failUpsertComment(error)));
    };

export const updateCommentThunk =
  (projectId: string, annotationId: string, record: CommentRecord) =>
    (dispatch: Dispatch): AsyncAction<CommentRecord, string> => {
      dispatch(triggerUpsertCommentLoading(record));
      return CommentService.update(projectId, annotationId, record.id, record.text)
        .then(updated => dispatch(succeedUpdateComment(updated)))
        .catch(error => dispatch(failUpsertComment(error)));
    };