"use client"

import { FC } from "react"

import { useChatContext } from "./chat-context"
import { ChatMessageEmptyState } from "./chat-empty-state/chat-message-empty-state"
import ChatInput from "./chat-input/chat-input"
import { ChatMessageContainer } from "./chat-message-container"

interface Prop {}

export const ChatUI: FC<Prop> = () => {
  const { id, messages, chatThreadLocked } = useChatContext()

  return (
    <div className="relative col-span-9 h-full flex-1 bg-pattern-bg shadow-md sm:text-base lg:text-lg">
      {messages.length !== 0 ? <ChatMessageContainer chatThreadId={id} /> : <ChatMessageEmptyState />}
      {!chatThreadLocked && <ChatInput />}
    </div>
  )
}
