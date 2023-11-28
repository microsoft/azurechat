-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('system', 'user', 'assistant', 'function');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('simple', 'data', 'mssql');

-- CreateEnum
CREATE TYPE "ConversationStyle" AS ENUM ('creative', 'balanced', 'precise');

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CHAT_MESSAGE',

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatThread" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "useName" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "chatType" "ChatType" NOT NULL,
    "conversationStyle" "ConversationStyle" NOT NULL,
    "chatOverFileName" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CHAT_THREAD',

    CONSTRAINT "ChatThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatDocument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "chatThreadId" TEXT NOT NULL,

    CONSTRAINT "ChatDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatDocument" ADD CONSTRAINT "ChatDocument_chatThreadId_fkey" FOREIGN KEY ("chatThreadId") REFERENCES "ChatThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
