-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'Teacher', 'Student');

-- CreateTable
CREATE TABLE "Annotation" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "text" TEXT NOT NULL,
    "startTime" REAL NOT NULL,
    "stopTime" REAL NOT NULL,
    "pause" BOOLEAN NOT NULL,
    "userId" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "extra" JSONB DEFAULT '{}',

    CONSTRAINT "Annotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "text" TEXT NOT NULL,
    "annotationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "extra" JSONB DEFAULT '{}',

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "videoId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "host" TEXT,
    "assignments" TEXT[],
    "publishedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "objective" TEXT NOT NULL,
    "levelStart" INTEGER NOT NULL,
    "levelEnd" INTEGER NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "collaborative" BOOLEAN NOT NULL,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "shareName" TEXT,
    "shareExpiresAt" TIMESTAMPTZ(6),
    "sharePassword" TEXT,
    "extra" JSONB DEFAULT '{}',

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "extra" JSONB DEFAULT '{}',

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagToProject" (
    "tagId" UUID NOT NULL,
    "projectId" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255),
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "code" TEXT,
    "codeGeneratedAt" TIMESTAMPTZ(6),
    "role" "UserRole",
    "extra" JSONB DEFAULT '{}',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserToProject" (
    "id" SERIAL NOT NULL,
    "userId" UUID,
    "projectId" UUID,

    CONSTRAINT "UserToProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "annotation_id_unique" ON "Annotation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "comment_id_unique" ON "Comment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "language_id_unique" ON "Language"("id");

-- CreateIndex
CREATE UNIQUE INDEX "project_id_unique" ON "Project"("id");

-- CreateIndex
CREATE UNIQUE INDEX "project_sharename_unique" ON "Project"("shareName");

-- CreateIndex
CREATE UNIQUE INDEX "tag_id_unique" ON "Tag"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TagToProjectTagIdProjectIdUnique" ON "TagToProject"("tagId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "user_id_unique" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_unique" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "annotation_projectid_foreign" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "annotation_userid_foreign" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "comment_annotationid_foreign" FOREIGN KEY ("annotationId") REFERENCES "Annotation"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "comment_userid_foreign" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "project_userid_foreign" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TagToProject" ADD CONSTRAINT "tagtoproject_projectid_foreign" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TagToProject" ADD CONSTRAINT "tagtoproject_tagid_foreign" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserToProject" ADD CONSTRAINT "usertoproject_projectid_foreign" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserToProject" ADD CONSTRAINT "usertoproject_userid_foreign" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

