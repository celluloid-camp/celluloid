CREATE SCHEMA "workflow";
--> statement-breakpoint
CREATE TYPE "public"."step_status" AS ENUM('pending', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('Admin', 'Teacher', 'Student');--> statement-breakpoint
CREATE TABLE "workflow"."workflow_events" (
	"id" varchar PRIMARY KEY NOT NULL,
	"type" varchar NOT NULL,
	"correlation_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"run_id" varchar NOT NULL,
	"payload" jsonb,
	"payload_cbor" "bytea",
	"spec_version" integer
);
--> statement-breakpoint
CREATE TABLE "workflow"."workflow_hooks" (
	"run_id" varchar NOT NULL,
	"hook_id" varchar PRIMARY KEY NOT NULL,
	"token" varchar NOT NULL,
	"owner_id" varchar NOT NULL,
	"project_id" varchar NOT NULL,
	"environment" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"metadata_cbor" "bytea",
	"spec_version" integer
);
--> statement-breakpoint
CREATE TABLE "workflow"."workflow_runs" (
	"id" varchar PRIMARY KEY NOT NULL,
	"output" jsonb,
	"output_cbor" "bytea",
	"deployment_id" varchar NOT NULL,
	"status" "status" NOT NULL,
	"name" varchar NOT NULL,
	"spec_version" integer,
	"execution_context" jsonb,
	"execution_context_cbor" "bytea",
	"input" jsonb,
	"input_cbor" "bytea",
	"error" text,
	"error_cbor" "bytea",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"started_at" timestamp,
	"expired_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "workflow"."workflow_steps" (
	"run_id" varchar NOT NULL,
	"step_id" varchar PRIMARY KEY NOT NULL,
	"step_name" varchar NOT NULL,
	"status" "step_status" NOT NULL,
	"input" jsonb,
	"input_cbor" "bytea",
	"output" jsonb,
	"output_cbor" "bytea",
	"error" text,
	"error_cbor" "bytea",
	"attempt" integer NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"retry_after" timestamp,
	"spec_version" integer
);
--> statement-breakpoint
CREATE TABLE "workflow"."workflow_stream_chunks" (
	"id" varchar NOT NULL,
	"stream_id" varchar NOT NULL,
	"run_id" varchar,
	"data" "bytea" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"eof" boolean NOT NULL,
	CONSTRAINT "workflow_stream_chunks_stream_id_id_pk" PRIMARY KEY("stream_id","id")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" uuid NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp(3),
	"refreshTokenExpiresAt" timestamp(3),
	"scope" text,
	"password" text,
	"createdAt" timestamp(3) NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Annotation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"startTime" real NOT NULL,
	"stopTime" real NOT NULL,
	"pause" boolean NOT NULL,
	"userId" uuid NOT NULL,
	"projectId" uuid NOT NULL,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"extra" jsonb DEFAULT '{}'::jsonb,
	"orignalUrl" text
);
--> statement-breakpoint
CREATE TABLE "Chapter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid NOT NULL,
	"startTime" double precision NOT NULL,
	"endTime" double precision NOT NULL,
	"title" text,
	"description" text,
	"thumbnailStorageId" uuid,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"lastEditedById" uuid
);
--> statement-breakpoint
CREATE TABLE "Comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"annotationId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"extra" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "Language" (
	"id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Playlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"userId" uuid NOT NULL,
	"publishedAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"videoId" text NOT NULL,
	"userId" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"host" text,
	"assignments" text[],
	"publishedAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"objective" text,
	"levelStart" integer,
	"levelEnd" integer,
	"public" boolean DEFAULT false NOT NULL,
	"collaborative" boolean NOT NULL,
	"shared" boolean DEFAULT false NOT NULL,
	"shareExpiresAt" timestamp(6) with time zone,
	"extra" json DEFAULT '{}'::json,
	"playlistId" uuid,
	"duration" double precision DEFAULT 0 NOT NULL,
	"metadata" json DEFAULT '{}'::json,
	"thumbnailUrl" text DEFAULT '' NOT NULL,
	"shareCode" text,
	"keywords" text[],
	"fileDownloadUrl" text,
	"scenesProcessingRunId" text,
	"scenesProcessingStatus" text DEFAULT 'not_started' NOT NULL,
	"transcriptProcessingRunId" text,
	"transcriptProcessingStatus" text DEFAULT 'not_started' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProjectNote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid,
	"userId" uuid NOT NULL,
	"content" jsonb,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(6) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProjectTranscript" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(6) with time zone NOT NULL,
	"language" text NOT NULL,
	"entries" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expiresAt" timestamp(3) NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp(3) NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Storage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"bucket" text NOT NULL,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255),
	"username" varchar(255) NOT NULL,
	"role" text DEFAULT 'Teacher' NOT NULL,
	"extra" jsonb DEFAULT '{}'::jsonb,
	"avatarStorageId" uuid,
	"bio" text,
	"initial" text,
	"color" text,
	"firstname" varchar(255),
	"lastname" varchar(255),
	"banExpires" timestamp(3),
	"banReason" text,
	"banned" boolean,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"name" text,
	"updatedAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"displayUsername" text
);
--> statement-breakpoint
CREATE TABLE "UserToProject" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" uuid,
	"projectId" uuid
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp(3) NOT NULL,
	"createdAt" timestamp(3),
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "VideoAnalysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid NOT NULL,
	"spriteStorageId" uuid,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(6) with time zone NOT NULL,
	"processing" json DEFAULT '{}'::json,
	"metadata" json DEFAULT '{}'::json,
	"status" text DEFAULT 'pending' NOT NULL,
	"visionJobId" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Annotation" ADD CONSTRAINT "annotation_projectid_foreign" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Annotation" ADD CONSTRAINT "annotation_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_thumbnailStorageId_fkey" FOREIGN KEY ("thumbnailStorageId") REFERENCES "public"."Storage"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_lastEditedById_fkey" FOREIGN KEY ("lastEditedById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Comment" ADD CONSTRAINT "comment_annotationid_foreign" FOREIGN KEY ("annotationId") REFERENCES "public"."Annotation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Comment" ADD CONSTRAINT "comment_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "project_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "Project_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "public"."Playlist"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ProjectNote" ADD CONSTRAINT "projectnote_projectid_foreign" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE set null ON UPDATE set null;--> statement-breakpoint
ALTER TABLE "ProjectNote" ADD CONSTRAINT "projectnote_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ProjectTranscript" ADD CONSTRAINT "ProjectTranscript_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_avatarStorageId_fkey" FOREIGN KEY ("avatarStorageId") REFERENCES "public"."Storage"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "UserToProject" ADD CONSTRAINT "usertoproject_projectid_foreign" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserToProject" ADD CONSTRAINT "usertoproject_userid_foreign" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "VideoAnalysis" ADD CONSTRAINT "VideoAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "VideoAnalysis" ADD CONSTRAINT "VideoAnalysis_spriteStorageId_fkey" FOREIGN KEY ("spriteStorageId") REFERENCES "public"."Storage"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "workflow_events_run_id_index" ON "workflow"."workflow_events" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "workflow_events_correlation_id_index" ON "workflow"."workflow_events" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "workflow_hooks_run_id_index" ON "workflow"."workflow_hooks" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "workflow_hooks_token_index" ON "workflow"."workflow_hooks" USING btree ("token");--> statement-breakpoint
CREATE INDEX "workflow_runs_name_index" ON "workflow"."workflow_runs" USING btree ("name");--> statement-breakpoint
CREATE INDEX "workflow_runs_status_index" ON "workflow"."workflow_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "workflow_steps_run_id_index" ON "workflow"."workflow_steps" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "workflow_steps_status_index" ON "workflow"."workflow_steps" USING btree ("status");--> statement-breakpoint
CREATE INDEX "workflow_stream_chunks_run_id_index" ON "workflow"."workflow_stream_chunks" USING btree ("run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "annotation_id_unique" ON "Annotation" USING btree ("id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Chapter_id_key" ON "Chapter" USING btree ("id" uuid_ops);--> statement-breakpoint
CREATE INDEX "Chapter_projectId_idx" ON "Chapter" USING btree ("projectId" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Chapter_thumbnailStorageId_key" ON "Chapter" USING btree ("thumbnailStorageId" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "comment_id_unique" ON "Comment" USING btree ("id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "language_id_unique" ON "Language" USING btree ("id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Playlist_id_key" ON "Playlist" USING btree ("id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "project_id_unique" ON "Project" USING btree ("id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "project_share_code_unique" ON "Project" USING btree ("shareCode" text_ops);--> statement-breakpoint
CREATE INDEX "ProjectNote_projectId_userId_idx" ON "ProjectNote" USING btree ("projectId" uuid_ops,"userId" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ProjectNote_projectId_userId_key" ON "ProjectNote" USING btree ("projectId" uuid_ops,"userId" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ProjectTranscript_projectId_key" ON "ProjectTranscript" USING btree ("projectId" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_key" ON "session" USING btree ("token" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_avatarStorageId_key" ON "User" USING btree ("avatarStorageId" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_unique" ON "User" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "user_id_unique" ON "User" USING btree ("id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "user_username_unique" ON "User" USING btree ("username" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "VideoAnalysis_spriteStorageId_key" ON "VideoAnalysis" USING btree ("spriteStorageId" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "videoanalysis_projectid_unique" ON "VideoAnalysis" USING btree ("projectId" uuid_ops);