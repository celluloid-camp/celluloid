import TagData from './Tag';
import { NewProjectData } from './Project';

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
  author: string;
  publishedAt: string;
}