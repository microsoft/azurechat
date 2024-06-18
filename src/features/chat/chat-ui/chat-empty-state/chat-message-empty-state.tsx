import { FC } from "react"

import Typography from "@/components/typography"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { ChatFileUI } from "@/features/chat/chat-ui/chat-file/chat-file-ui"
import { Card } from "@/features/ui/card"

import { EasterEgg } from "./chat-easter-egg"
import { ChatSensitivitySelector } from "./chat-sensitivity-selector"
import { ChatStyleSelector } from "./chat-style-selector"
import { ChatTypeSelector } from "./chat-type-selector"

interface Prop {}

export const ChatMessageEmptyState: FC<Prop> = () => {
  const { chatBody } = useChatContext()

  const { fileState } = useChatContext()

  return (
    <div className="max:h-5/6 container mx-auto grid w-full max-w-3xl grid-cols-5 items-center justify-center gap-9 overflow-auto p-4 pb-[140px]">
      <Card className="col-span-6 flex flex-col gap-2 rounded-md p-4">
        <div className="flex flex-col gap-1">
          <Typography variant="h4">Set the Sensitivity of your chat</Typography>
          <ChatSensitivitySelector disable={false} />
        </div>
        <div className="flex flex-col gap-1">
          <Typography variant="h4">Choose a conversation style</Typography>
          <ChatStyleSelector disable={false} />
        </div>
        <div className="flex flex-col gap-1">
          <Typography variant="h4">How would you like to chat?</Typography>
          <ChatTypeSelector disable={fileState.isUploadingFile || !!chatBody.chatOverFileName} />
        </div>
        {chatBody.chatType === "data" || chatBody.chatType === "audio" ? (
          <ChatFileUI />
        ) : (
          <div className="flex flex-col gap-1"></div>
        )}
        <EasterEgg />
      </Card>
    </div>
  )
}
