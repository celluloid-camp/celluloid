// The TypeScript definitions below are automatically generated.
// Do not touch them, or risk, your modifications being lost.

export enum UserRole {
  Admin = "Admin",
  Teacher = "Teacher",
  Student = "Student",
}

export enum Table {
  Annotation = "Annotation",
  Comment = "Comment",
  Language = "Language",
  Project = "Project",
  Session = "Session",
  Tag = "Tag",
  TagToProject = "TagToProject",
  User = "User",
  UserToProject = "UserToProject",
}

export type Annotation = {
  id: string;
  text: string;
  startTime: number;
  stopTime: number;
  pause: boolean;
  userId: string;
  projectId: string;
};

export type Comment = {
  id: string;
  annotationId: string;
  userId: string;
  text: string;
  createdAt: Date;
};

export type Language = {
  id: string;
  name: string | null;
};

export type Project = {
  id: string;
  videoId: string;
  title: string;
  description: string;
  assignments: string[] | null;
  publishedAt: Date;
  objective: string;
  levelStart: number;
  levelEnd: number;
  public: boolean;
  collaborative: boolean;
  userId: string;
  shared: boolean;
  shareName: string | null;
  shareExpiresAt: Date | null;
  sharePassword: string | null;
  host: string;
};

export type Session = {
  sid: string;
  session: string;
  expiresAt: Date;
};

export type Tag = {
  id: string;
  name: string;
  featured: boolean;
};

export type TagToProject = {
  tagId: string;
  projectId: string;
};

export type User = {
  id: string;
  email: string | null;
  password: string;
  confirmed: boolean;
  code: string | null;
  codeGeneratedAt: Date | null;
  username: string;
  role: UserRole;
};

export type UserToProject = {
  userId: string;
  projectId: string;
};

