-- CreateTable
CREATE TABLE "ProjectTranscript" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "language" TEXT NOT NULL,
    "entries" JSONB NOT NULL,

    CONSTRAINT "ProjectTranscript_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTranscript_projectId_key" ON "ProjectTranscript"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTranscript_projectId_language_key" ON "ProjectTranscript"("projectId", "language");

-- AddForeignKey
ALTER TABLE "ProjectTranscript" ADD CONSTRAINT "ProjectTranscript_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
