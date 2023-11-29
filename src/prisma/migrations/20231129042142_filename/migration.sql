/*
  Warnings:

  - Added the required column `file_name` to the `document_embedding` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "document_embedding" ADD COLUMN     "file_name" TEXT NOT NULL;
