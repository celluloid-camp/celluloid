-- CreateTable
CREATE TABLE "queue_jobs" (
    "id" BIGSERIAL NOT NULL,
    "queue" TEXT NOT NULL,
    "key" TEXT,
    "cron" TEXT,
    "payload" JSONB,
    "result" JSONB,
    "error" JSONB,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notBefore" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "queue_jobs_queue_priority_runAt_finishedAt_idx" ON "queue_jobs"("queue", "priority", "runAt", "finishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "queue_jobs_key_runAt_key" ON "queue_jobs"("key", "runAt");
