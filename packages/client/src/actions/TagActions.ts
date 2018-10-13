import { TagData } from '@celluloid/types';
import { Dispatch } from 'redux';
import TagService from 'services/TagService';
import {
  ActionType,
  AsyncAction,
  createAction,
  createEmptyAction,
  createErrorAction
} from 'types/ActionTypes';

export const triggerListTags = () =>
  createEmptyAction(ActionType.TRIGGER_LIST_TAGS);

export const failListTags = (error: string) =>
  createErrorAction(ActionType.FAIL_LIST_TAGS, error);

export const succeedListTags = (tags: TagData[]) =>
  createAction(ActionType.SUCCEED_LIST_TAGS, tags);

export const triggerInsertTag = () =>
  createEmptyAction(ActionType.TRIGGER_INSERT_TAG);

export const failInsertTag = (error: string) =>
  createErrorAction(ActionType.FAIL_INSERT_TAG, error);

export const succeedInsertTag = (tag: TagData) =>
  createAction(ActionType.SUCCEED_INSERT_TAG, tag);

export const createTagThunk =
  (name: string) => (dispatch: Dispatch): AsyncAction<TagData, string> => {
    return TagService.post(name)
      .then(tag => {
        return dispatch(succeedInsertTag(tag));
      })
      .catch(error => {
        return dispatch(failInsertTag(error.message));
      });
  };

export const listTagsThunk =
  () => (dispatch: Dispatch): AsyncAction<TagData[], string> => {
    return TagService.list()
      .then(tags => {
        return dispatch(succeedListTags(tags));
      })
      .catch(error => {
        return dispatch(failListTags(error.message));
      });
  };