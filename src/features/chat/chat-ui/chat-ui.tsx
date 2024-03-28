"use client"

import { FC } from "react"
import { useChatContext } from "./chat-context"
import { ChatMessageEmptyState } from "./chat-empty-state/chat-message-empty-state"
import ChatInput from "./chat-input/chat-input"
import { ChatMessageContainer } from "./chat-message-container"

interface Prop {}

export const ChatUI: FC<Prop> = () => {
  const { id, messages } = useChatContext()

  return (
    <div className="relative col-span-6 h-full flex-1 overflow-hidden bg-altBackground text-text shadow-md sm:text-lg md:col-span-5 lg:col-span-4 lg:text-xl xl:col-span-5">
      {messages.length !== 0 ? <ChatMessageContainer chatThreadId={id} /> : <ChatMessageEmptyState />}
      <ChatInput />
    </div>
  )
}
