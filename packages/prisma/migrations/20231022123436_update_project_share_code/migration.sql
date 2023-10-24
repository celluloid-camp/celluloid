/*
  Warnings:

  - You are about to drop the column `shareName` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `sharePassword` on the `Project` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shareCode]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "project_sharename_unique";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "shareName",
DROP COLUMN "sharePassword",
ADD COLUMN     "shareCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "project_share_code_unique" ON "Project"("shareCode");
