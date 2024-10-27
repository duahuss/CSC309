-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('C', 'CPP', 'Java', 'Python', 'JavaScript');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "phone_number" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "blog_post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "blog_post_id" TEXT,
    "comment_id" TEXT,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BlogPostTemplates" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_BlogPostTemplates_AB_unique" ON "_BlogPostTemplates"("A", "B");

-- CreateIndex
CREATE INDEX "_BlogPostTemplates_B_index" ON "_BlogPostTemplates"("B");

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_blog_post_id_fkey" FOREIGN KEY ("blog_post_id") REFERENCES "BlogPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_blog_post_id_fkey" FOREIGN KEY ("blog_post_id") REFERENCES "BlogPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostTemplates" ADD CONSTRAINT "_BlogPostTemplates_A_fkey" FOREIGN KEY ("A") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostTemplates" ADD CONSTRAINT "_BlogPostTemplates_B_fkey" FOREIGN KEY ("B") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
