import { Dispatch } from 'redux';
import YoutubeService from 'services/YoutubeService';
import {
  ActionType,
  AsyncAction,
  createAction,
  createEmptyAction,
  createErrorAction,
} from 'types/ActionTypes';
import { YoutubeVideo } from 'types/YoutubeTypes';

function getVideoId(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);

    const id = parsed.hostname.endsWith('youtu.be')
      ? parsed.pathname.replace(/\//, '')
      : parsed.searchParams.get('v');
    return id ? resolve(id) : reject();
  });
}

export const failLoadVideo = (error: string) =>
  createErrorAction(ActionType.FAIL_LOAD_VIDEO, error);

export const succeedLoadVideo = (video: YoutubeVideo) =>
  createAction(ActionType.SUCCEED_LOAD_VIDEO, video);

export const loadVideoThunk = (url: string) => (dispatch: Dispatch):
  AsyncAction<YoutubeVideo, string> => {
  return getVideoId(url)
    .then(id =>
      YoutubeService.getVideoNameById(id)
        .then((videoTitle: string) =>
          dispatch(succeedLoadVideo({
            id,
            title: videoTitle,
            thumbnailUrl: `http://img.youtube.com/vi/${id}/0.jpg`
          }))
        )
    )
    .catch(() => dispatch(failLoadVideo('InvalidLink')));
};

export const discardNewVideo = () =>
  createEmptyAction(ActionType.DISCARD_NEW_VIDEO);