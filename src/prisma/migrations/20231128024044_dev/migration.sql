/*
  Warnings:

  - You are about to drop the column `context` on the `ChatThread` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "context" TEXT;

-- AlterTable
ALTER TABLE "ChatThread" DROP COLUMN "context";
