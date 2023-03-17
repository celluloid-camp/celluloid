import { AnnotationData, AnnotationRecord } from '@celluloid/types';
import { Dispatch } from 'redux';
import AnnotationService from 'services/AnnotationService';
import {
  ActionType,
  AsyncAction,
  createAction,
  createEmptyAction,
  createErrorAction,
} from 'types/ActionTypes';

export const triggerListAnnotationsLoading = () =>
  createEmptyAction(ActionType.TRIGGER_LIST_ANNOTATIONS_LOADING);

export const succeedListAnnotations = (annotations: AnnotationRecord[]) =>
  createAction(ActionType.SUCCEED_LIST_ANNOTATIONS, annotations);

export const failListAnnotations = (error: string) =>
  createErrorAction(ActionType.FAIL_LIST_ANNOTATIONS, error);

export const triggerFocusAnnotation = (annotation: AnnotationRecord) =>
  createAction(ActionType.TRIGGER_FOCUS_ANNOTATION, annotation);

export const triggerBlurAnnotation = () =>
  createEmptyAction(ActionType.TRIGGER_BLUR_ANNOTATION);

export const triggerCancelAnnotation = (annotation?: AnnotationRecord) =>
  createAction(ActionType.TRIGGER_CANCEL_ANNOTATION, annotation);

export const triggerEditAnnotation = (annotation: AnnotationRecord) =>
  createAction(ActionType.TRIGGER_EDIT_ANNOTATION, annotation);

export const triggerAddAnnotation = () =>
  createEmptyAction(ActionType.TRIGGER_ADD_ANNOTATION);

export const triggerUpsertAnnotationLoading = (annotation?: AnnotationRecord) =>
  createAction(ActionType.TRIGGER_UPSERT_ANNOTATION_LOADING, annotation);

export const failUpsertAnnotation = (error: string) =>
  createErrorAction(ActionType.FAIL_UPSERT_ANNOTATION, error);

export const succeedAddAnnotation = (annotation: AnnotationRecord) =>
  createAction(ActionType.SUCCEED_ADD_ANNOTATION, annotation);

export const succeedUpdateAnnotation = (annotation: AnnotationRecord) =>
  createAction(ActionType.SUCCEED_UPDATE_ANNOTATION, annotation);

export const triggerDeleteAnnotationLoading = (annotation: AnnotationRecord) =>
  createAction(ActionType.TRIGGER_DELETE_ANNOTATION_LOADING, annotation);

export const failDeleteAnnotation = (error: string) =>
  createErrorAction(ActionType.FAIL_DELETE_ANNOTATION, error);

export const succeedDeleteAnnotation = (annotation: AnnotationRecord) =>
  createAction(ActionType.SUCCEED_DELETE_ANNOTATION, annotation);

export const listAnnotationsThunk =
  (projectId: string) =>
    (dispatch: Dispatch): AsyncAction<AnnotationRecord[], string> => {
      dispatch(triggerListAnnotationsLoading());
      return AnnotationService.list(projectId)
        .then(annotations => dispatch(succeedListAnnotations(annotations)))
        .catch(error => dispatch(failListAnnotations(error)));
    };

export const createAnnotationThunk =
  (projectId: string, data: AnnotationData) =>
    (dispatch: Dispatch): AsyncAction<AnnotationRecord, string> => {
      dispatch(triggerUpsertAnnotationLoading());
      return AnnotationService.create(projectId, data)
        .then(annotation => {
          return dispatch(succeedAddAnnotation(annotation));
        })
        .catch(error => dispatch(failUpsertAnnotation(error)));
    };

export const updateAnnotationThunk =
  (projectId: string, record: AnnotationRecord) =>
    (dispatch: Dispatch): AsyncAction<AnnotationRecord, string> => {
      dispatch(triggerUpsertAnnotationLoading(record));
      return AnnotationService.update(projectId, record.id, record)
        .then(annotation => {
          return dispatch(succeedUpdateAnnotation(annotation));
        })
        .catch(error => dispatch(failUpsertAnnotation(error)));
    };

export const deleteAnnotationThunk =
  (projectId: string, annotation: AnnotationRecord) =>
    (dispatch: Dispatch): AsyncAction<AnnotationRecord, string> => {
      dispatch(triggerDeleteAnnotationLoading(annotation));
      return AnnotationService.delete(projectId, annotation.id)
        .then(() => {
          return dispatch(succeedDeleteAnnotation(annotation));
        })
        .catch(error => dispatch(failDeleteAnnotation(error)));
    };
