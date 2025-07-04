-- CreateTable
CREATE TABLE "VideoAnalysis" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "spriteStorageId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "processing" JSON DEFAULT '{}',
    "metadata" JSON DEFAULT '{}',

    CONSTRAINT "VideoAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "videoanalysis_projectid_unique" ON "VideoAnalysis"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoAnalysis_spriteStorageId_key" ON "VideoAnalysis"("spriteStorageId");

-- AddForeignKey
ALTER TABLE "VideoAnalysis" ADD CONSTRAINT "VideoAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAnalysis" ADD CONSTRAINT "VideoAnalysis_spriteStorageId_fkey" FOREIGN KEY ("spriteStorageId") REFERENCES "Storage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
