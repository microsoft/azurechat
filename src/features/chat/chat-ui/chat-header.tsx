import { FC } from "react"

import { useChatContext } from "./chat-context"
import { ChatFilesDisplay } from "./chat-file/chat-file-list"
import { ChatSelectedOptions } from "./chat-header-display/chat-selected-options"

interface Prop {}

export const ChatHeader: FC<Prop> = () => {
  const { chatBody } = useChatContext()
  const files = chatBody.chatOverFileName.split(", ")

  return (
    <div className="flex items-start gap-2">
      <ChatSelectedOptions />
      <div className="hidden sm:block">
        {chatBody.chatOverFileName.length != 0 && <ChatFilesDisplay files={files} />}
      </div>
    </div>
  )
}
