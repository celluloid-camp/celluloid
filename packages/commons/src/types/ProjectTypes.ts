import { TagData } from './TagTypes';
import { NewProjectData } from './ProjectTypes';
import { TeacherData } from './TeacherTypes';

export interface NewProjectData {
  videoId: string;
  title: string;
  description?: string;
  objective: string;
  assignments: Array<string>;
  tags: TagData[];
  levelStart: number;
  levelEnd: number;
  public: boolean;
  collaborative: boolean;
}

export interface ProjectData extends NewProjectData {
  id: string;
  views?: number;
  shares?: number;
  userId: string;
  publishedAt: Date;
  shared: boolean;
  shareName?: string;
  shareExpiresAt: string;
}

export interface DisplayProjectData extends ProjectData {
  user: TeacherData;
}

export interface ProjectShareData {
  sharePassword: string;
  shareExpiresAt: Date;
  shareName: string;
  shareMaxUsers: number;
}