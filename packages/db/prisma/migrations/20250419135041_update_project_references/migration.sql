-- DropForeignKey
ALTER TABLE "ProjectNote" DROP CONSTRAINT "projectnote_projectid_foreign";

-- DropForeignKey
ALTER TABLE "ProjectNote" DROP CONSTRAINT "projectnote_userid_foreign";

-- DropForeignKey
ALTER TABLE "ProjectQueueJob" DROP CONSTRAINT "ProjectQueueJob_queueJobId_fkey";

-- AlterTable
ALTER TABLE "ProjectNote" ALTER COLUMN "projectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProjectQueueJob" ADD CONSTRAINT "ProjectQueueJob_queueJobId_fkey" FOREIGN KEY ("queueJobId") REFERENCES "queue_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectNote" ADD CONSTRAINT "projectnote_projectid_foreign" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "ProjectNote" ADD CONSTRAINT "projectnote_userid_foreign" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
