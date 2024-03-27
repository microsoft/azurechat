"use client"

import { Button } from "@/features/ui/button"
import { MessageSquarePlus } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  CreateChatThread,
  FindChatThreadByTitleAndEmpty,
  UpdateChatThreadCreatedAt,
} from "../chat-services/chat-thread-service"
import { useGlobalMessageContext } from "@/features/globals/global-message-context"

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
      className="size-[40px] gap-2 rounded-md p-1"
      variant="default"
      onClick={startNewChat}
      ariaLabel="Start a new chat"
      onKeyDown={handleKeyDown}
    >
      <MessageSquarePlus size={40} strokeWidth={1.2} />
    </Button>
  )
}
