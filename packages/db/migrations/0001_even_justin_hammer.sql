ALTER TABLE "Chapter" DROP CONSTRAINT "Chapter_thumbnailStorageId_fkey";
--> statement-breakpoint
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_thumbnailStorageId_fkey" FOREIGN KEY ("thumbnailStorageId") REFERENCES "public"."Storage"("id") ON DELETE cascade ON UPDATE cascade;