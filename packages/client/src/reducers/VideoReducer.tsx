import { ActionType } from '@celluloid/client/src/types/ActionTypes';
import { AnyAction } from 'redux';
import { ComponentStatus, VideoState } from 'types/StateTypes';

const initialState = {
  status: ComponentStatus.LOADING,
  annotations: new Set(),
  comments: new Set(),
  editing: false,
  focusedAnnotation: undefined,
  upsertAnnotationLoading: false,
  deleteAnnotationLoading: false,
  focusedComment: undefined,
  upsertCommentLoading: false,
  deleteCommentLoading: false
} as VideoState;

export default (state = initialState, { type, payload }: AnyAction):
  VideoState => {
  switch (type) {
    case ActionType.TRIGGER_LIST_ANNOTATIONS_LOADING:
      return {
        ...initialState,
        status: ComponentStatus.LOADING,
      };
    case ActionType.FAIL_LIST_ANNOTATIONS:
      return {
        ...initialState,
        status: ComponentStatus.ERROR,
        loadingError: payload
      };
    case ActionType.SUCCEED_LIST_ANNOTATIONS:
      return {
        ...state,
        annotations: payload,
        status: ComponentStatus.READY,
        loadingError: undefined
      };
    case ActionType.TRIGGER_FOCUS_ANNOTATION:
      return {
        ...state,
        focusedAnnotation:
          state.focusedAnnotation !== payload
          ? payload
          : undefined,
      };
    case ActionType.TRIGGER_BLUR_ANNOTATION:
      return {
        ...state,
        focusedAnnotation: undefined
      };
    case ActionType.TRIGGER_EDIT_ANNOTATION:
      return {
        ...state,
        editing: true,
        focusedAnnotation: payload
      };
    case ActionType.TRIGGER_ADD_ANNOTATION:
      return {
        ...state,
        editing: true,
        focusedAnnotation: undefined
      };
    case ActionType.TRIGGER_CANCEL_ANNOTATION:
      return {
        ...state,
        editing: false,
      };
    case ActionType.TRIGGER_UPSERT_ANNOTATION_LOADING:
      return {
        ...state,
        upsertAnnotationLoading: true,
      };
    case ActionType.FAIL_UPSERT_ANNOTATION:
      return {
        ...state,
        upsertAnnotationLoading: false,
        annotationError: payload,
      };
    case ActionType.SUCCEED_UPSERT_ANNOTATION:
      return {
        ...state,
        focusedAnnotation: payload,
        upsertAnnotationLoading: false,
        editing: false,
        annotationError: undefined,
      };
    case ActionType.TRIGGER_DELETE_ANNOTATION_LOADING:
      return {
        ...state,
        deleteAnnotationLoading: true,
        focusedAnnotation: payload
      };
    case ActionType.FAIL_DELETE_ANNOTATION:
      return {
        ...state,
        annotationError: payload,
        deleteAnnotationLoading: false,
      };
    case ActionType.SUCCEED_DELETE_ANNOTATION:
      return {
        ...state,
        deleteAnnotationLoading: false,
        annotationError: undefined,
        focusedAnnotation: undefined,
      };
    case ActionType.TRIGGER_DELETE_COMMENT_LOADING:
      return {
        ...state,
        deleteCommentLoading: true,
      };
    case ActionType.FAIL_DELETE_COMMENT:
      return {
        ...state,
        commentError: payload,
        deleteCommentLoading: false,
      };
    case ActionType.SUCCEED_DELETE_COMMENT:
      return {
        ...state,
        deleteAnnotationLoading: false,
        commentError: undefined,
        focusedComment: undefined,
      };
    case ActionType.TRIGGER_UPSERT_COMMENT_LOADING:
      return {
        ...state,
        upsertCommentLoading: true
      };
    case ActionType.FAIL_UPSERT_COMMENT:
      return {
        ...state,
        upsertCommentLoading: false,
        commentError: payload
      };
    case ActionType.SUCCEED_UPSERT_COMMENT:
      return {
        ...state,
        upsertCommentLoading: false,
        commentError: undefined,
        focusedComment: undefined
      };
    case ActionType.TRIGGER_LIST_COMMENTS_LOADING:
    case ActionType.FAIL_LIST_COMMENTS:
    case ActionType.SUCCEED_LIST_COMMENTS:
    case ActionType.TRIGGER_FOCUS_COMMENT:
    case ActionType.TRIGGER_BLUR_COMMENT:
    case ActionType.TRIGGER_ADD_COMMENT:
    case ActionType.TRIGGER_CANCEL_COMMENT:
    case ActionType.TRIGGER_EDIT_COMMENT:
    default:
      return state;
  }
};