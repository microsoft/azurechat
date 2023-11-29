/*
  Warnings:

  - You are about to drop the `ChatDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatThread` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentEmbedding` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatDocument" DROP CONSTRAINT "ChatDocument_chatThreadId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_threadId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentEmbedding" DROP CONSTRAINT "DocumentEmbedding_documentId_fkey";

-- DropTable
DROP TABLE "ChatDocument";

-- DropTable
DROP TABLE "ChatMessage";

-- DropTable
DROP TABLE "ChatThread";

-- DropTable
DROP TABLE "DocumentEmbedding";

-- CreateTable
CREATE TABLE "chat_message" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "thread_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CHAT_MESSAGE',
    "context" TEXT,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_thread" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "use_name" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "chatType" "ChatType" NOT NULL,
    "conversationStyle" "ConversationStyle" NOT NULL,
    "chat_over_file_name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CHAT_THREAD',

    CONSTRAINT "chat_thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "chat_thread_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CHAT_DOCUMENT',
    "blob" BYTEA NOT NULL,
    "text_content" TEXT NOT NULL,

    CONSTRAINT "chat_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_embedding" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "content_length" INTEGER NOT NULL,
    "content_tokens" INTEGER NOT NULL,
    "embedding" vector(1536),
    "document_id" TEXT NOT NULL,

    CONSTRAINT "document_embedding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "chat_thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_document" ADD CONSTRAINT "chat_document_chat_thread_id_fkey" FOREIGN KEY ("chat_thread_id") REFERENCES "chat_thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_embedding" ADD CONSTRAINT "document_embedding_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "chat_document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
