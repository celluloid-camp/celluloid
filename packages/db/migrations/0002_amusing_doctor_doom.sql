ALTER TABLE "Project" RENAME COLUMN "thumbnailURL" TO "thumbnail_url";--> statement-breakpoint
ALTER TABLE "VideoAnalysis" RENAME COLUMN "processing" TO "data";--> statement-breakpoint
ALTER TABLE "VideoAnalysis" ALTER COLUMN "visionJobId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "VideoAnalysis" ADD COLUMN "sprite_url" text;
