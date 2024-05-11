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

export const MiniNewChat = (): JSX.Element => {
  const router = useRouter()
  const { showError } = useGlobalMessageContext()

  const startNewChat = async (): Promise<void> => {
    const title = "New Chat"

    try {
      const existingThreadResponse = await FindChatThreadByTitleAndEmpty(title)
      if (existingThreadResponse.status === "OK" && existingThreadResponse.response) {
        await UpdateChatThreadCreatedAt(existingThreadResponse.response?.id)
        router.push(`/chat/${existingThreadResponse.response?.id}`)
      } else {
        const newChatThreadResponse = await CreateChatThread()
        if (newChatThreadResponse.status === "OK" && newChatThreadResponse.response?.id)
          router.push(`/chat/${newChatThreadResponse.response?.id}`)
      }
      router.refresh()
    } catch (_error) {
      showError("Failed to start a new chat. Please try again later.")
    }
  }

  return (
    <div className="absolute right-4 top-4 z-50 lg:hidden">
      <Button
        ariaLabel="Start a new chat"
        role="button"
        tabIndex={0}
        className="size-[40px] gap-2 rounded-md p-1"
        variant="default"
        onClick={startNewChat}
        onKeyDown={async e => e.key === "Enter" && (await startNewChat())}
      >
        <MessageSquarePlus size={40} strokeWidth={1.2} aria-hidden="true" />
      </Button>
    </div>
  )
}
