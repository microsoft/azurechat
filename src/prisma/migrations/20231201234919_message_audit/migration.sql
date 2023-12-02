-- CreateTable
CREATE TABLE "message_audit" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "thread_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "prompt_tokens" INTEGER NOT NULL,
    "response_tokens" INTEGER NOT NULL,
    "prompt_message" TEXT NOT NULL,
    "response_message" TEXT NOT NULL,

    CONSTRAINT "message_audit_pkey" PRIMARY KEY ("id")
);
