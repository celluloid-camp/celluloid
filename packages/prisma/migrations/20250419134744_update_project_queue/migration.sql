-- DropForeignKey
ALTER TABLE "ProjectQueueJob" DROP CONSTRAINT "ProjectQueueJob_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectQueueJob" DROP CONSTRAINT "ProjectQueueJob_queueJobId_fkey";

-- AddForeignKey
ALTER TABLE "ProjectQueueJob" ADD CONSTRAINT "ProjectQueueJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectQueueJob" ADD CONSTRAINT "ProjectQueueJob_queueJobId_fkey" FOREIGN KEY ("queueJobId") REFERENCES "queue_jobs"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
