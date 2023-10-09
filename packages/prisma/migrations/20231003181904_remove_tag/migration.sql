/*
  Warnings:

  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TagToProject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TagToProject" DROP CONSTRAINT "tagtoproject_projectid_foreign";

-- DropForeignKey
ALTER TABLE "TagToProject" DROP CONSTRAINT "tagtoproject_tagid_foreign";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "TagToProject";
