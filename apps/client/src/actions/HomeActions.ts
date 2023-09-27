
import {
  ActionType,
  createAction,
  createEmptyAction,
  createErrorAction,
} from "~types/ActionTypes";
import { PeertubeVideoInfo } from "~types/YoutubeTypes";

export const failLoadVideo = (error: string) =>
  createErrorAction(ActionType.FAIL_LOAD_VIDEO, error);

export const succeedLoadVideo = (video: PeertubeVideoInfo) =>
  createAction(ActionType.SUCCEED_LOAD_VIDEO, video);


export const discardNewVideo = () =>
  createEmptyAction(ActionType.DISCARD_NEW_VIDEO);
