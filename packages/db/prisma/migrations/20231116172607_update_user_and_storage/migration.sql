/*
  Warnings:

  - A unique constraint covering the columns `[avatarStorageId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "keywords" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarStorageId" UUID,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "firstname" VARCHAR(255),
ADD COLUMN     "lastname" VARCHAR(255);

-- CreateTable
CREATE TABLE "Storage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "path" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_avatarStorageId_key" ON "User"("avatarStorageId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarStorageId_fkey" FOREIGN KEY ("avatarStorageId") REFERENCES "Storage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
