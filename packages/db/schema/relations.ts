import { relations } from "drizzle-orm/relations";
import {
  account,
  annotation,
  chapter,
  comment,
  playlist,
  project,
  projectNote,
  projectTranscript,
  session,
  storage,
  user,
  userToProject,
  videoAnalysis,
} from "./schema";

export const userRelations = relations(user, ({ one, many }) => ({
  storage: one(storage, {
    fields: [user.avatarStorageId],
    references: [storage.id],
  }),
  comments: many(comment),
  userToProjects: many(userToProject),
  projects: many(project),
  annotations: many(annotation),
  playlists: many(playlist),
  chapters: many(chapter),
  sessions: many(session),
  accounts: many(account),
  projectNotes: many(projectNote),
}));

export const storageRelations = relations(storage, ({ many }) => ({
  users: many(user),
  chapters: many(chapter),
  videoAnalyses: many(videoAnalysis),
}));

export const commentRelations = relations(comment, ({ one }) => ({
  annotation: one(annotation, {
    fields: [comment.annotationId],
    references: [annotation.id],
  }),
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
}));

export const annotationRelations = relations(annotation, ({ one, many }) => ({
  comments: many(comment),
  project: one(project, {
    fields: [annotation.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [annotation.userId],
    references: [user.id],
  }),
}));

export const userToProjectRelations = relations(userToProject, ({ one }) => ({
  project: one(project, {
    fields: [userToProject.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [userToProject.userId],
    references: [user.id],
  }),
}));

export const projectRelations = relations(project, ({ one, many }) => ({
  userToProjects: many(userToProject),
  user: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
  playlist: one(playlist, {
    fields: [project.playlistId],
    references: [playlist.id],
  }),
  annotations: many(annotation),
  chapters: many(chapter),
  projectNotes: many(projectNote),
  projectTranscripts: many(projectTranscript),
  videoAnalyses: many(videoAnalysis),
}));

export const playlistRelations = relations(playlist, ({ one, many }) => ({
  projects: many(project),
  user: one(user, {
    fields: [playlist.userId],
    references: [user.id],
  }),
}));

export const chapterRelations = relations(chapter, ({ one }) => ({
  project: one(project, {
    fields: [chapter.projectId],
    references: [project.id],
  }),
  storage: one(storage, {
    fields: [chapter.thumbnailStorageId],
    references: [storage.id],
  }),
  user: one(user, {
    fields: [chapter.lastEditedById],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const projectNoteRelations = relations(projectNote, ({ one }) => ({
  project: one(project, {
    fields: [projectNote.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [projectNote.userId],
    references: [user.id],
  }),
}));

export const projectTranscriptRelations = relations(
  projectTranscript,
  ({ one }) => ({
    project: one(project, {
      fields: [projectTranscript.projectId],
      references: [project.id],
    }),
  }),
);

export const videoAnalysisRelations = relations(videoAnalysis, ({ one }) => ({
  project: one(project, {
    fields: [videoAnalysis.projectId],
    references: [project.id],
  }),
  storage: one(storage, {
    fields: [videoAnalysis.spriteStorageId],
    references: [storage.id],
  }),
}));
