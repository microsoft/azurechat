"use client"

import { MessageSquarePlus } from "lucide-react"

import { useChatThreads } from "@/features/chat/chat-ui/chat-threads-context"
import { Button } from "@/features/ui/button"

export const NewChat = (): JSX.Element => {
  const { createThread } = useChatThreads()

  const startNewChat = async (): Promise<void> => await createThread("New Chat")

  const handleKeyDown = async (e: React.KeyboardEvent): Promise<void> => {
    if (e.key === "Enter") await startNewChat()
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
