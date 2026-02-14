-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "scenesProcessingRunId" TEXT,
ADD COLUMN     "scenesProcessingStatus" TEXT DEFAULT 'not_started',
ADD COLUMN     "transcriptProcessingRunId" TEXT,
ADD COLUMN     "transcriptProcessingStatus" TEXT DEFAULT 'not_started';
