CREATE TABLE IF NOT EXISTS "PeertubeInstance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"host" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"isIndex" boolean DEFAULT false NOT NULL,
	"thumbnail" text NOT NULL,
	"isPublic" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PeertubeInstanceAuth" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"instanceHost" text NOT NULL,
	"usernameOrEmail" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"accessTokenExpiresAt" timestamp(6) with time zone,
	"status" text DEFAULT 'failed' NOT NULL,
	"lastError" text,
	"createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"lastUsedAt" timestamp(6) with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PeertubeInstance" ADD CONSTRAINT "PeertubeInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PeertubeInstanceAuth" ADD CONSTRAINT "PeertubeInstanceAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "PeertubeInstance_user_host_key" ON "PeertubeInstance" USING btree ("userId","host");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "PeertubeInstanceAuth_user_host_key" ON "PeertubeInstanceAuth" USING btree ("userId","instanceHost");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "PeertubeInstanceAuth_userId_idx" ON "PeertubeInstanceAuth" USING btree ("userId");
