import {
  AnnotationRecord,
  CommentRecord,
  Credentials,
  ProjectGraphRecord,
  ProjectRecord,
  SigninErrors,
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
  annotations: Set<AnnotationRecord>;
  comments: Set<CommentRecord>;
  editing: boolean;
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

export interface ProjectPageState {
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
  status: ComponentStatus;
  error?: string;
  projects: Set<ProjectGraphRecord>;
}

export interface ProjectGridState {
  status: ComponentStatus;
  projectList: Set<ProjectRecord>;
}

export interface SharingState {
  status: SharingStatus;
  error?: string;
}

export interface AppState extends RouterState {
  sharing: SharingState;
  project: ProjectPageState;
  home: HomeState;
  user?: UserRecord;
  signin: SigninState;
  updated: boolean;
}
