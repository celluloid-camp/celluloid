-- DropForeignKey
ALTER TABLE "ProjectTranscript" DROP CONSTRAINT "ProjectTranscript_projectId_fkey";

-- AddForeignKey
ALTER TABLE "ProjectTranscript" ADD CONSTRAINT "ProjectTranscript_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
