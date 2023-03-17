import { AnnotationRecord, CommentRecord } from "@celluloid/types";
import * as R from "ramda";
import { AnyAction } from "redux";
import { ActionType } from "types/ActionTypes";
import { ComponentStatus, VideoState } from "types/StateTypes";

const initialState = {
  status: ComponentStatus.LOADING,
  annotations: [],
  editing: false,
  commenting: false,
  focusedAnnotation: undefined,
  upsertAnnotationLoading: false,
  deleteAnnotationLoading: false,
  focusedComment: undefined,
  upsertCommentLoading: false,
  deleteCommentLoading: false,
} as VideoState;

const sortAnnotations = R.compose<
  AnnotationRecord[],
  AnnotationRecord[],
  AnnotationRecord[]
>(R.sort(R.ascend(R.prop("startTime"))), R.sort(R.ascend(R.prop("id"))));

const filterOutAnnotation = (
  annotation: AnnotationRecord,
  annotations: AnnotationRecord[]
) => {
  return R.filter((elem: AnnotationRecord) => elem.id !== annotation.id)(
    annotations
  );
};

const sortComments = R.compose<
  CommentRecord[],
  CommentRecord[],
  CommentRecord[]
>(R.sort(R.ascend(R.prop("createdAt"))), R.sort(R.ascend(R.prop("id"))));

const filterOutComment = (
  comment: CommentRecord,
  comments: CommentRecord[]
) => {
  return R.filter((elem: CommentRecord) => elem.id !== comment.id)(comments);
};

const findById = R.converge(R.find, [
  R.pipe(R.nthArg(0), R.propEq("id")),
  R.nthArg(1),
]);

const deleteComment = (
  comment: CommentRecord,
  annotations: AnnotationRecord[]
) => {
  const annotation = findById(comment.annotationId, annotations);

  return [
    ...filterOutAnnotation(annotation, annotations),
    {
      ...annotation,
      comments: sortComments(filterOutComment(comment, annotation.comments)),
    },
  ];
};

const addComment = (
  comment: CommentRecord,
  annotations: AnnotationRecord[]
) => {
  const annotation = findById(comment.annotationId, annotations);

  return [
    ...filterOutAnnotation(annotation, annotations),
    {
      ...annotation,
      comments: sortComments([...annotation.comments, comment]),
    },
  ];
};

const updateComment = (
  comment: CommentRecord,
  annotations: AnnotationRecord[]
) => {
  const annotation = findById(comment.annotationId, annotations);

  return [
    ...filterOutAnnotation(annotation, annotations),
    {
      ...annotation,
      comments: sortComments([
        ...filterOutComment(comment, annotation.comments),
        comment,
      ]),
    },
  ];
};

export default (
  state = initialState,
  { type, payload }: AnyAction
): VideoState => {
  switch (type) {
    case ActionType.CLEAR_PROJECT:
      return initialState;
    case ActionType.TRIGGER_LIST_ANNOTATIONS_LOADING:
      return {
        ...initialState,
        status: ComponentStatus.LOADING,
      };
    case ActionType.FAIL_LIST_ANNOTATIONS:
      return {
        ...initialState,
        status: ComponentStatus.ERROR,
        loadingError: payload,
      };
    case ActionType.SUCCEED_LIST_ANNOTATIONS:
      return {
        ...state,
        annotations: payload,
        status: ComponentStatus.READY,
        loadingError: undefined,
      };
    case ActionType.TRIGGER_FOCUS_ANNOTATION:
      return {
        ...state,
        focusedAnnotation:
          state.focusedAnnotation !== payload ? payload : undefined,
      };
    case ActionType.TRIGGER_BLUR_ANNOTATION:
      return {
        ...state,
        focusedAnnotation: undefined,
      };
    case ActionType.TRIGGER_EDIT_ANNOTATION:
      return {
        ...state,
        editing: true,
        focusedAnnotation: payload,
      };
    case ActionType.TRIGGER_ADD_ANNOTATION:
      return {
        ...state,
        editing: true,
        focusedAnnotation: undefined,
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
    case ActionType.SUCCEED_UPDATE_ANNOTATION:
      return {
        ...state,
        annotations: sortAnnotations([
          ...R.filter((elem: AnnotationRecord) => elem.id !== payload.id)(
            state.annotations
          ),
          payload,
        ]),
        focusedAnnotation: payload,
        upsertAnnotationLoading: false,
        editing: false,
        annotationError: undefined,
      };
    case ActionType.SUCCEED_ADD_ANNOTATION:
      return {
        ...state,
        annotations: sortAnnotations([...state.annotations, payload]),
        focusedAnnotation: payload,
        upsertAnnotationLoading: false,
        editing: false,
        annotationError: undefined,
      };
    case ActionType.TRIGGER_DELETE_ANNOTATION_LOADING:
      return {
        ...state,
        deleteAnnotationLoading: true,
        focusedAnnotation: payload,
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
        annotations: sortAnnotations(
          filterOutAnnotation(payload, state.annotations)
        ),
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
        annotations: deleteComment(payload, state.annotations),
        deleteAnnotationLoading: false,
        commentError: undefined,
        focusedComment: undefined,
      };
    case ActionType.TRIGGER_UPSERT_COMMENT_LOADING:
      return {
        ...state,
        upsertCommentLoading: true,
      };
    case ActionType.FAIL_UPSERT_COMMENT:
      return {
        ...state,
        upsertCommentLoading: false,
        commentError: payload,
      };
    case ActionType.SUCCEED_UPDATE_COMMENT:
      return {
        ...state,
        annotations: updateComment(payload, state.annotations),
        commenting: false,
        upsertCommentLoading: false,
        commentError: undefined,
        focusedComment: undefined,
      };
    case ActionType.SUCCEED_ADD_COMMENT:
      return {
        ...state,
        annotations: addComment(payload, state.annotations),
        commenting: false,
        upsertCommentLoading: false,
        commentError: undefined,
        focusedComment: undefined,
      };
    case ActionType.TRIGGER_ADD_COMMENT:
      return {
        ...state,
        focusedComment: undefined,
        commenting: true,
      };
    case ActionType.TRIGGER_CANCEL_EDIT_COMMENT:
      return {
        ...state,
        focusedComment: undefined,
        commenting: false,
      };
    case ActionType.TRIGGER_EDIT_COMMENT:
      return {
        ...state,
        focusedComment: payload,
        commenting: true,
      };
    default:
      return state;
  }
};
