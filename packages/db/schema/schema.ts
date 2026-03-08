import { PeerTubeVideo } from "@celluloid/peertube";
import type { DetectionResultsModel } from "@celluloid/vision-api/types";
import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  foreignKey,
  index,
  integer,
  json,
  jsonb,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { AnnotationShape } from "./types";
export const userRole = pgEnum("UserRole", ["Admin", "Teacher", "Student"]);

export const user = pgTable(
  "User",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: varchar({ length: 255 }),
    username: varchar({ length: 255 }).notNull(),
    role: text()
      .notNull()
      .$type<"Admin" | "Teacher" | "Student">()
      .default("Teacher"),
    extra: jsonb().default({}),
    avatarStorageId: uuid(),
    bio: text(),
    initial: text(),
    color: text(),
    firstname: varchar({ length: 255 }),
    lastname: varchar({ length: 255 }),
    banExpires: timestamp({ precision: 3, mode: "string" }),
    banReason: text(),
    banned: boolean(),
    createdAt: timestamp({ precision: 6, withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    emailVerified: boolean().default(false).notNull(),
    image: text(),
    name: text(),
    updatedAt: timestamp({ precision: 6, withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    displayUsername: text(),
  },
  (table) => [
    uniqueIndex("User_avatarStorageId_key").using(
      "btree",
      table.avatarStorageId.asc().nullsLast().op("uuid_ops"),
    ),
    uniqueIndex("user_email_unique").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("user_id_unique").using(
      "btree",
      table.id.asc().nullsLast().op("uuid_ops"),
    ),
    uniqueIndex("user_username_unique").using(
      "btree",
      table.username.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.avatarStorageId],
      foreignColumns: [storage.id],
      name: "User_avatarStorageId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export type UserSelect = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;

export const language = pgTable(
  "Language",
  {
    id: text().notNull(),
    name: text().notNull(),
  },
  (table) => [
    uniqueIndex("language_id_unique").using(
      "btree",
      table.id.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const comment = pgTable(
  "Comment",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    text: text().notNull(),
    annotationId: uuid().notNull(),
    userId: uuid().notNull(),
    createdAt: timestamp({
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    extra: jsonb().default({}),
  },
  (table) => [
    uniqueIndex("comment_id_unique").using(
      "btree",
      table.id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.annotationId],
      foreignColumns: [annotation.id],
      name: "comment_annotationid_foreign",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "comment_userid_foreign",
    }).onDelete("cascade"),
  ],
);

export const userToProject = pgTable(
  "UserToProject",
  {
    id: serial().primaryKey().notNull(),
    userId: uuid(),
    projectId: uuid(),
  },
  (table) => [
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [project.id],
      name: "usertoproject_projectid_foreign",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "usertoproject_userid_foreign",
    }).onDelete("cascade"),
  ],
);

export const project = pgTable(
  "Project",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    videoId: text().notNull(),
    userId: uuid().notNull(),
    title: text().notNull(),
    description: text().notNull(),
    host: text(),
    assignments: text().array(),
    publishedAt: timestamp({ precision: 6, withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    objective: text(),
    levelStart: integer(),
    levelEnd: integer(),
    public: boolean().default(false).notNull(),
    collaborative: boolean().notNull(),
    shared: boolean().default(false).notNull(),
    shareExpiresAt: timestamp({
      precision: 6,
      withTimezone: true,
      mode: "string",
    }),
    extra: json().default({}),
    playlistId: uuid(),
    duration: doublePrecision().default(0).notNull(),
    metadata: json()
      .$type<PeerTubeVideo>()
      .default({} as PeerTubeVideo),
    thumbnailURL: text("thumbnail_url").default("").notNull(),
    shareCode: text(),
    keywords: text().array(),
    fileDownloadUrl: text(),
    scenesProcessingRunId: text(),
    scenesProcessingStatus: text()
      .notNull()
      .$type<"not_started" | "in_progress" | "completed" | "failed">()
      .default("not_started"),
    transcriptProcessingRunId: text(),
    transcriptProcessingStatus: text()
      .notNull()
      .$type<"not_started" | "in_progress" | "completed" | "failed">()
      .default("not_started"),
  },
  (table) => [
    uniqueIndex("project_id_unique").using(
      "btree",
      table.id.asc().nullsLast().op("uuid_ops"),
    ),
    uniqueIndex("project_share_code_unique").using(
      "btree",
      table.shareCode.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "project_userid_foreign",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.playlistId],
      foreignColumns: [playlist.id],
      name: "Project_playlistId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export type ProjectSelect = typeof project.$inferSelect;
export type ProjectInsert = typeof project.$inferInsert;

export const annotation = pgTable(
  "Annotation",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    text: text().notNull(),
    startTime: real().notNull(),
    stopTime: real().notNull(),
    pause: boolean().notNull(),
    userId: uuid().notNull(),
    projectId: uuid().notNull(),
    createdAt: timestamp({
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    extra: jsonb()
      .$type<AnnotationShape>()
      .default({} as AnnotationShape),
    // orignalUrl: text(),
  },
  (table) => [
    uniqueIndex("annotation_id_unique").using(
      "btree",
      table.id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [project.id],
      name: "annotation_projectid_foreign",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "annotation_userid_foreign",
    }).onDelete("cascade"),
  ],
);

export type AnnotationSelect = typeof annotation.$inferSelect;
export type AnnotationInsert = typeof annotation.$inferInsert;

export const playlist = pgTable(
  "Playlist",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    title: text().notNull(),
    description: text().notNull(),
    userId: uuid().notNull(),
    publishedAt: timestamp({ precision: 6, withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("Playlist_id_key").using(
      "btree",
      table.id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Playlist_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const storage = pgTable("Storage", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  path: text().notNull(),
  bucket: text().notNull(),
  createdAt: timestamp({
    precision: 6,
    withTimezone: true,
    mode: "string",
  }).default(sql`CURRENT_TIMESTAMP`),
});

export const chapter = pgTable(
  "Chapter",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    projectId: uuid().notNull(),
    startTime: doublePrecision().notNull(),
    endTime: doublePrecision().notNull(),
    title: text(),
    description: text(),
    thumbnailStorageId: uuid(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
    lastEditedById: uuid(),
  },
  (table) => [
    uniqueIndex("Chapter_id_key").using(
      "btree",
      table.id.asc().nullsLast().op("uuid_ops"),
    ),
    index("Chapter_projectId_idx").using(
      "btree",
      table.projectId.asc().nullsLast().op("uuid_ops"),
    ),
    uniqueIndex("Chapter_thumbnailStorageId_key").using(
      "btree",
      table.thumbnailStorageId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [project.id],
      name: "Chapter_projectId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.thumbnailStorageId],
      foreignColumns: [storage.id],
      name: "Chapter_thumbnailStorageId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.lastEditedById],
      foreignColumns: [user.id],
      name: "Chapter_lastEditedById_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const verification = pgTable("verification", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ precision: 3, mode: "string" }).notNull(),
  createdAt: timestamp({ precision: 3, mode: "string" }),
  updatedAt: timestamp({ precision: 3, mode: "string" }),
});

export const session = pgTable(
  "session",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    expiresAt: timestamp({ precision: 3, mode: "string" }).notNull(),
    token: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: "string" }).notNull(),
    updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: uuid().notNull(),
  },
  (table) => [
    uniqueIndex("session_token_key").using(
      "btree",
      table.token.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const account = pgTable(
  "account",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: uuid().notNull(),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ precision: 3, mode: "string" }),
    refreshTokenExpiresAt: timestamp({ precision: 3, mode: "string" }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ precision: 3, mode: "string" }).notNull(),
    updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const projectNote = pgTable(
  "ProjectNote",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    projectId: uuid(),
    userId: uuid().notNull(),
    content: jsonb(),
    createdAt: timestamp({ precision: 6, withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("ProjectNote_projectId_userId_idx").using(
      "btree",
      table.projectId.asc().nullsLast().op("uuid_ops"),
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    uniqueIndex("ProjectNote_projectId_userId_key").using(
      "btree",
      table.projectId.asc().nullsLast().op("uuid_ops"),
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [project.id],
      name: "projectnote_projectid_foreign",
    })
      .onUpdate("set null")
      .onDelete("set null"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "projectnote_userid_foreign",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const projectTranscript = pgTable(
  "ProjectTranscript",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    projectId: uuid().notNull(),
    content: text().notNull(),
    createdAt: timestamp({ precision: 6, withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    language: text().notNull(),
    entries: jsonb().notNull(),
  },
  (table) => [
    uniqueIndex("ProjectTranscript_projectId_key").using(
      "btree",
      table.projectId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [project.id],
      name: "ProjectTranscript_projectId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export type VideoAnalysisStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type VideoAnalysisErrorCode = "timeout" | "internal_error";

export const videoAnalysis = pgTable(
  "VideoAnalysis",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    projectId: uuid().notNull(),
    spriteStorageId: uuid(),
    createdAt: timestamp({ precision: 6, withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    data: json().$type<DetectionResultsModel>(),
    spriteURL: text("sprite_url"),
    metadata: json().default({}),
    status: text().$type<VideoAnalysisStatus>().default("pending").notNull(),
    errorCode: text("error_code").$type<VideoAnalysisErrorCode>(),
    errorMessage: text("error_message"),
    visionJobId: text(),
  },
  (table) => [
    uniqueIndex("VideoAnalysis_spriteStorageId_key").using(
      "btree",
      table.spriteStorageId.asc().nullsLast().op("uuid_ops"),
    ),
    uniqueIndex("videoanalysis_projectid_unique").using(
      "btree",
      table.projectId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [project.id],
      name: "VideoAnalysis_projectId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.spriteStorageId],
      foreignColumns: [storage.id],
      name: "VideoAnalysis_spriteStorageId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);
