ALTER TABLE "VideoAnalysis" ADD COLUMN "error_code" text;--> statement-breakpoint
ALTER TABLE "VideoAnalysis" ADD COLUMN "error_message" text;--> statement-breakpoint
ALTER TABLE "Annotation" DROP COLUMN IF EXISTS "orignalUrl";
