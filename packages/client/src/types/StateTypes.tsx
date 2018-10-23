import { YoutubeVideo } from 'types/YoutubeTypes';
import {
  AnnotationRecord,
  CommentRecord,
  Credentials,
  ProjectGraphRecord,
  SigninErrors,
  TagData,
  UserRecord
} from '@celluloid/types';
import * as SigninDialog from 'components/Signin';
import { RouterState } from 'connected-react-router';

export interface SigninState {
  loading: boolean;
  dialog: SigninDialog.SigninState;
  errors: SigninErrors;
  credentials?: Credentials;
}

export interface VideoState {
  status: ComponentStatus;
  loadingError?: boolean;
  annotations: AnnotationRecord[];
  editing: boolean;
  commenting: boolean;
  annotationError?: string;
  focusedAnnotation?: AnnotationRecord;
  upsertAnnotationLoading: boolean;
  deleteAnnotationLoading: boolean;
  commentError?: string;
  focusedComment?: CommentRecord;
  upsertCommentLoading: boolean;
  deleteCommentLoading: boolean;
}

export interface ProjectDetailsState {
  status: ComponentStatus;
  error?: string;
  project?: ProjectGraphRecord;
  setPublicLoading: boolean;
  setCollaborativeLoading: boolean;
  unshareLoading: boolean;
  deleteLoading: boolean;
  setPublicError?: string;
  setCollaborativeError?: string;
  unshareError?: string;
  deleteError?: string;
}

export interface PlayerState {
  seeking: boolean;
  seekTarget: number;
}

export interface ProjectState {
  player: PlayerState;
  video: VideoState;
  details: ProjectDetailsState;
}

export enum SharingStatus {
  OPEN,
  ERROR,
  LOADING,
  CLOSED
}

export enum ComponentStatus {
  LOADING,
  ERROR,
  READY
}

export interface HomeState {
  errors: {
    projects?: string,
    video?: string,
    createProject?: string;
  };
  projects: ProjectGraphRecord[];
  video?: YoutubeVideo;
  createProjectLoading: boolean;
}

export interface SharingState {
  status: SharingStatus;
  error?: string;
}

export interface AppState extends RouterState {
  tags: TagData[];
  sharing: SharingState;
  project: ProjectState;
  home: HomeState;
  user?: UserRecord;
  signin: SigninState;
  updated: boolean;
}
