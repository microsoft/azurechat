/*
  Warnings:

  - Added the required column `blob` to the `ChatDocument` table without a default value. This is not possible if the table is not empty.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "ChatDocument" ADD COLUMN     "blob" BYTEA NOT NULL;

-- CreateTable
CREATE TABLE "DocumentEmbedding" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentLength" INTEGER NOT NULL,
    "contentTokens" INTEGER NOT NULL,
    "embedding" vector(1536),
    "documentId" TEXT NOT NULL,

    CONSTRAINT "DocumentEmbedding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DocumentEmbedding" ADD CONSTRAINT "DocumentEmbedding_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ChatDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
