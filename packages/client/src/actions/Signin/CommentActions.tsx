import { CommentRecord } from '@celluloid/types';
import { ActionType, createAction, createEmptyAction, createErrorAction } from 'types/ActionTypes';

export const triggerFocusComment = (comment: CommentRecord) =>
  createAction(ActionType.TRIGGER_FOCUS_COMMENT, comment);

export const triggerBlurComment = (comment: CommentRecord) =>
  createAction(ActionType.TRIGGER_BLUR_COMMENT, comment);

export const triggerCancelComment = (comment: CommentRecord) =>
  createAction(ActionType.TRIGGER_CANCEL_COMMENT, comment);

export const triggerEditComment = (comment: CommentRecord) =>
  createAction(ActionType.TRIGGER_EDIT_COMMENT, comment);

export const triggerAddComment = () =>
  createEmptyAction(ActionType.TRIGGER_ADD_COMMENT);

export const triggerUpsertCommentLoading = (comment?: CommentRecord) =>
  createAction(ActionType.TRIGGER_UPSERT_COMMENT_LOADING, comment);

export const failUpsertComment = (error: string) =>
  createErrorAction(ActionType.FAIL_UPSERT_COMMENT, error);

export const succeedUpsertComment = (comment: CommentRecord) =>
  createAction(ActionType.SUCCEED_UPSERT_COMMENT, comment);

export const triggerDeleteCommentLoading = (comment: CommentRecord) =>
  createAction(ActionType.TRIGGER_DELETE_COMMENT_LOADING, comment);

export const failDeleteComment = (error: string) =>
  createErrorAction(ActionType.FAIL_DELETE_COMMENT, error);

export const succeedDeleteComment = () =>
  createEmptyAction(ActionType.SUCCEED_DELETE_COMMENT);

// export const deleteCommentThunk =
//   (projectId: string, annotationId: string, comment: CommentRecord) =>
//     (dispatch: Dispatch): AsyncAction<null, string> => {
//       dispatch(triggerDeleteCommentLoading(comment));
//       return CommentService.delete(projectId, annotationId, comment.id)
//         .then(() => dispatch(succeedDeleteComment()))
//         .catch(error => dispatch(failDeleteComment(error)));
//     };

// export const listCommentsThunk =
//   (projectId: string, annotationId: string) =>
//     (dispatch: Dispatch): AsyncAction<CommentRecord[], string> => {
//       dispatch(triggerListCommentsLoading());
//       return CommentService.list(projectId, annotationId)
//         .then(comments => dispatch(succeedListComments(comments)))
//         .catch(error => dispatch(failListComments(error)));
//     };

// export const createCommentThunk =
//   (projectId: string, annotationId: string, data: CommentData) =>
//     (dispatch: Dispatch): AsyncAction<CommentRecord, string> => {
//       dispatch(triggerUpsertCommentLoading());
//       return CommentService.create(projectId, annotationId, data)
//         .then(comment => dispatch(succeedUpsertComment(comment)))
//         .catch(error => dispatch(failUpsertComment(error)));
//     };

// export const updateCommentThunk =
//   (projectId: string, annotationId: string, record: CommentRecord) =>
//     (dispatch: Dispatch): AsyncAction<CommentRecord, string> => {
//       dispatch(triggerUpsertCommentLoading(record));
//       return CommentService.update(projectId, annotationId, record.id, record)
//         .then(comment => dispatch(succeedUpsertComment(comment)))
//         .catch(error => dispatch(failUpsertComment(error)));
//     };