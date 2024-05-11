"use client"

import { MessageSquarePlus } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  CreateChatThread,
  FindChatThreadByTitleAndEmpty,
  UpdateChatThreadCreatedAt,
} from "@/features/chat/chat-services/chat-thread-service"
import { useGlobalMessageContext } from "@/features/globals/global-message-context"
import { Button } from "@/features/ui/button"

export const NewChat = (): JSX.Element => {
  const router = useRouter()
  const { showError } = useGlobalMessageContext()

  const startNewChat = async (): Promise<void> => {
    const title = "New Chat"

    try {
      const existingThread = await FindChatThreadByTitleAndEmpty(title)
      if (existingThread.status !== "OK") {
        showError("Failed to start a new chat. Please try again later.")
        return
      }

      if (!existingThread.response) {
        const newChatThread = await CreateChatThread()
        if (newChatThread.status !== "OK") throw newChatThread
        router.push(`/chat/${newChatThread.response.chatThreadId}`)
        return
      }

      await UpdateChatThreadCreatedAt(existingThread.response.chatThreadId)
      router.push(`/chat/${existingThread.response.chatThreadId}`)
    } catch (_error) {
      showError("Failed to start a new chat. Please try again later.")
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent): Promise<void> => {
    if (e.key === "Enter") {
      await startNewChat()
    }
  }

  return (
    <Button
      className="h-max-[40px] size-full gap-2 rounded-md p-4"
      variant="default"
      onClick={startNewChat}
      ariaLabel="Start a new chat"
      onKeyDown={handleKeyDown}
    >
      New Chat
      <MessageSquarePlus size={30} strokeWidth={1.2} className="hidden sm:block" />
    </Button>
  )
}
