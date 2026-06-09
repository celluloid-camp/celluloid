CREATE TYPE "public"."wait_status" AS ENUM('waiting', 'completed');--> statement-breakpoint
CREATE TABLE "workflow"."workflow_waits" (
	"wait_id" varchar PRIMARY KEY NOT NULL,
	"run_id" varchar NOT NULL,
	"status" "wait_status" NOT NULL,
	"resume_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"spec_version" integer
);
--> statement-breakpoint
CREATE TABLE "VideoScenes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid NOT NULL,
	"spriteStorageId" uuid,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(6) with time zone NOT NULL,
	"data" json,
	"sprite_url" text,
	"metadata" json DEFAULT '{}'::json,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_code" text,
	"error_message" text,
	"visionJobId" text,
	"run_id" text
);
--> statement-breakpoint
ALTER TABLE "Project" RENAME COLUMN "thumbnailURL" TO "thumbnail_url";--> statement-breakpoint
ALTER TABLE "VideoAnalysis" ALTER COLUMN "visionJobId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow"."workflow_hooks" ADD COLUMN "is_webhook" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "VideoAnalysis" ADD COLUMN "data" json;--> statement-breakpoint
ALTER TABLE "VideoAnalysis" ADD COLUMN "sprite_url" text;--> statement-breakpoint
ALTER TABLE "VideoAnalysis" ADD COLUMN "error_code" text;--> statement-breakpoint
ALTER TABLE "VideoAnalysis" ADD COLUMN "error_message" text;--> statement-breakpoint
ALTER TABLE "VideoAnalysis" ADD COLUMN "run_id" text;--> statement-breakpoint
ALTER TABLE "VideoScenes" ADD CONSTRAINT "VideoScenes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "VideoScenes" ADD CONSTRAINT "VideoScenes_spriteStorageId_fkey" FOREIGN KEY ("spriteStorageId") REFERENCES "public"."Storage"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "workflow_waits_run_id_index" ON "workflow"."workflow_waits" USING btree ("run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "VideoScenes_spriteStorageId_key" ON "VideoScenes" USING btree ("spriteStorageId" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "videoScenes_projectid_unique" ON "VideoScenes" USING btree ("projectId" uuid_ops);--> statement-breakpoint
ALTER TABLE "Annotation" DROP COLUMN "orignalURL";--> statement-breakpoint
ALTER TABLE "ProjectTranscript" DROP COLUMN "entries";--> statement-breakpoint
ALTER TABLE "VideoAnalysis" DROP COLUMN "processing";