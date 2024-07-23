import { FC } from "react"

import Typography from "@/components/typography"

import { useChatContext } from "./chat-context"
import { ChatFilesDisplay } from "./chat-file/chat-file-list"
import { ChatSelectedOptions } from "./chat-header-display/chat-selected-options"

interface Prop {}

export const ChatHeader: FC<Prop> = () => {
  const { chatBody, tenantPreferences } = useChatContext()
  const files = chatBody.chatOverFileName.split(", ")
  const customRef = tenantPreferences?.customReferenceFields?.find(c => c.name === "internalReference")

  return (
    <div className="flex items-start gap-2">
      <ChatSelectedOptions />
      <div className="hidden sm:block">
        {(chatBody.internalReference?.length ?? 0) > 0 && (
          <div className="flex min-h-[40px] items-center gap-1 rounded-md bg-backgroundShade p-2">
            <Typography variant="p" className="font-bold" tabIndex={0}>
              {customRef?.label || "Reference ID"}:
            </Typography>
            <Typography variant="span" className="ml-1" tabIndex={0}>
              {chatBody.internalReference}
            </Typography>
          </div>
        )}
      </div>
      <div className="hidden sm:block">
        {chatBody.chatOverFileName.length !== 0 && <ChatFilesDisplay files={files} />}
      </div>
    </div>
  )
}
