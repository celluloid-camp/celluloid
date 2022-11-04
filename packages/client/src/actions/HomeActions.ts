import { openSignup } from 'actions/Signin';
import { UserRecord } from '@celluloid/types';
import { Dispatch } from 'redux';
import VideoService from 'services/VideoService';
import {
  ActionType,
  AsyncAction,
  createAction,
  createEmptyAction,
  createErrorAction,
} from 'types/ActionTypes';
import { PeertubeVideoInfo } from 'types/YoutubeTypes';



export const failLoadVideo = (error: string) =>
  createErrorAction(ActionType.FAIL_LOAD_VIDEO, error);

export const succeedLoadVideo = (video: PeertubeVideoInfo) =>
  createAction(ActionType.SUCCEED_LOAD_VIDEO, video);

export const loadVideoThunk = (url: string, user?: UserRecord) => (dispatch: Dispatch):
  AsyncAction<PeertubeVideoInfo, string> => {
  return  VideoService.getPeerTubeVideoData(url)
  .then((data: PeertubeVideoInfo) => {
    if (!user || user.role !== 'Teacher') {
      dispatch(openSignup());
    }
    return dispatch(succeedLoadVideo(data));
  }).catch(() => dispatch(failLoadVideo('InvalidLink')));
    
};

export const discardNewVideo = () =>
  createEmptyAction(ActionType.DISCARD_NEW_VIDEO);