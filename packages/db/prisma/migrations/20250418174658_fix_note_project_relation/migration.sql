-- DropForeignKey
ALTER TABLE "ProjectNote" DROP CONSTRAINT "ProjectNote_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectNote" DROP CONSTRAINT "ProjectNote_userId_fkey";

-- AddForeignKey
ALTER TABLE "ProjectNote" ADD CONSTRAINT "projectnote_projectid_foreign" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProjectNote" ADD CONSTRAINT "projectnote_userid_foreign" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
