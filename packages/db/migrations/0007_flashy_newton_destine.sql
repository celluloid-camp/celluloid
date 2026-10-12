ALTER TYPE "public"."step_status" SET SCHEMA "workflow";--> statement-breakpoint
ALTER TYPE "public"."wait_status" SET SCHEMA "workflow";--> statement-breakpoint
ALTER TYPE "public"."status" SET SCHEMA "workflow";--> statement-breakpoint
CREATE TABLE "workflow"."workflow_event_slots" (
	"run_id" varchar PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow"."workflow_invocations" (
	"sequence" bigserial NOT NULL,
	"run_id" varchar NOT NULL,
	"request_id" varchar NOT NULL,
	"payload" "bytea",
	"fingerprint" varchar,
	"result" "bytea",
	"result_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"expired_at" timestamp,
	CONSTRAINT "workflow_invocations_run_id_request_id_pk" PRIMARY KEY("run_id","request_id")
);
--> statement-breakpoint
CREATE TABLE "workflow"."workflow_snapshots" (
	"run_id" varchar PRIMARY KEY NOT NULL,
	"data" "bytea" NOT NULL,
	"events_cursor" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflow"."workflow_events" DROP CONSTRAINT "workflow_events_pkey";--> statement-breakpoint
ALTER TABLE "workflow"."workflow_events" ADD CONSTRAINT "workflow_events_run_id_id_pk" PRIMARY KEY("run_id","id");--> statement-breakpoint
DROP INDEX "workflow"."workflow_events_run_id_index";--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'teacher';--> statement-breakpoint
ALTER TABLE "workflow"."workflow_events" ADD COLUMN "resume_id" varchar;--> statement-breakpoint
ALTER TABLE "workflow"."workflow_events" ADD COLUMN "resume_payload_digest" varchar;--> statement-breakpoint
ALTER TABLE "workflow"."workflow_hooks" ADD COLUMN "token_retention_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "workflow"."workflow_hooks" ADD COLUMN "is_system" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "workflow"."workflow_hooks" ADD COLUMN "resume_context" "bytea";--> statement-breakpoint
ALTER TABLE "workflow"."workflow_hooks" ADD COLUMN "claimed_from" "bytea";--> statement-breakpoint
ALTER TABLE "workflow"."workflow_runs" ADD COLUMN "error_code" varchar;--> statement-breakpoint
ALTER TABLE "workflow"."workflow_runs" ADD COLUMN "attributes" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow"."workflow_runs" ADD COLUMN "encryption_public_key" varchar;--> statement-breakpoint
ALTER TABLE "workflow"."workflow_runs" ADD COLUMN "dynamic_workflow_code_cbor" "bytea";--> statement-breakpoint
CREATE INDEX "workflow_invocations_pending" ON "workflow"."workflow_invocations" USING btree ("run_id","sequence") WHERE "workflow"."workflow_invocations"."responded_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_events_hook_resume_unique" ON "workflow"."workflow_events" USING btree ("run_id","resume_id") WHERE "workflow"."workflow_events"."type" = 'hook_received' AND "workflow"."workflow_events"."resume_id" IS NOT NULL;--> statement-breakpoint
WITH "ranked_workflow_events" AS (
	SELECT
		ctid,
		ROW_NUMBER() OVER (
			PARTITION BY "run_id", "correlation_id", "type"
			ORDER BY ctid
		) AS "row_num"
	FROM "workflow"."workflow_events"
	WHERE "type" IN ('step_created', 'hook_created', 'wait_created', 'attr_set')
)
DELETE FROM "workflow"."workflow_events"
WHERE ctid IN (
	SELECT ctid
	FROM "ranked_workflow_events"
	WHERE "row_num" > 1
);--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_events_entity_creation_unique" ON "workflow"."workflow_events" USING btree ("run_id","correlation_id","type") WHERE "workflow"."workflow_events"."type" IN ('step_created', 'hook_created', 'wait_created', 'attr_set');