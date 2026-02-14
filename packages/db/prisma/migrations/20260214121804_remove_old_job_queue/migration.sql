/*
  Warnings:

  - You are about to drop the `ProjectQueueJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `queue_jobs` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `status` on table `VideoAnalysis` required. This step will fail if there are existing NULL values in that column.
  - Made the column `visionJobId` on table `VideoAnalysis` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ProjectQueueJob" DROP CONSTRAINT "ProjectQueueJob_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectQueueJob" DROP CONSTRAINT "ProjectQueueJob_queueJobId_fkey";

-- AlterTable
ALTER TABLE "VideoAnalysis" ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending',
ALTER COLUMN "visionJobId" SET NOT NULL;

-- DropTable
DROP TABLE "ProjectQueueJob";

-- DropTable
DROP TABLE "queue_jobs";
