import { TagData } from './TagTypes';
import { UserRecord } from './UserTypes';

export interface ProjectCreateData {
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

export interface ProjectUpdateData {
  title: string;
  description?: string;
  objective: string;
  assigments: Array<string>;
  tags: TagData[];
  levelStart: number;
  leverEnd: number;
  public: boolean;
  collaborative: boolean;
}

export interface ProjectRecord extends ProjectCreateData {
  id: string;
  userId: string;
  publishedAt: Date;
  shared: boolean;
  shareName: string;
  sharePassword: string;
  shareExpiresAt: string;
}

export interface ProjectGraphRecord extends ProjectRecord {
  user: UserRecord;
  members: UserRecord[];
}

export interface ProjectShareData {
  sharePassword: string;
  // shareExpiresAt: Date;
  // shareMaxUsers: number;
}
