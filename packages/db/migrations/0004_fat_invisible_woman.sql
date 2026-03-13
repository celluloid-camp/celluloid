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
ALTER TABLE "workflow"."workflow_hooks" ADD COLUMN "is_webhook" boolean DEFAULT true;--> statement-breakpoint
CREATE INDEX "workflow_waits_run_id_index" ON "workflow"."workflow_waits" USING btree ("run_id");