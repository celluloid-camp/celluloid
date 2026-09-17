UPDATE "User" SET "name" = "username" WHERE "name" IS NULL;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "name" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
