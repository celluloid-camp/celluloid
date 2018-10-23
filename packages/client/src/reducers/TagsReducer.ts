import { ActionType } from 'types/ActionTypes';
import { TagData } from '@celluloid/types';
import * as R from 'ramda';
import { AnyAction } from 'redux';

const sortTags = R.compose<TagData[], TagData[]>(
  R.sort(R.ascend(R.prop('name')))
);

export default (state = [], {type, payload}: AnyAction): TagData[] => {
    switch (type) {
      case ActionType.SUCCEED_LIST_TAGS:
        return sortTags(payload);
      case ActionType.SUCCEED_INSERT_TAG:
        return sortTags([...state, payload]);
      default:
        return state;
    }
};
