/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `session` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "session_token_key";

-- AlterTable
ALTER TABLE "Annotation" ADD COLUMN     "detection" TEXT,
ADD COLUMN     "emotion" TEXT,
ADD COLUMN     "mode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
