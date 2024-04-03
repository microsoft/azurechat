import { FC } from "react"

import { MiniNewChat } from "@/features/chat/chat-menu/mini-new-chat"

import { useChatContext } from "./chat-context"
import { ChatSelectedOptions } from "./chat-header-display/chat-selected-options"

interface Prop {}

export const ChatHeader: FC<Prop> = () => {
  const { chatBody } = useChatContext()

  return (
    <div className="flex flex-col gap-2">
      <ChatSelectedOptions />
      <div className="flex h-2 gap-2">
        <p className="items-center text-sm" tabIndex={0}>
          {chatBody.chatOverFileName}
        </p>
      </div>
      <MiniNewChat />
    </div>
  )
}
