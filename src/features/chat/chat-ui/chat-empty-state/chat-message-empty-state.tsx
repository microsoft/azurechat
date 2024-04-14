import { FC } from "react"

import { FindChatThreadForCurrentUser, UpsertChatThread } from "@/features/chat/chat-services/chat-thread-service"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { ChatFileUI } from "@/features/chat/chat-ui/chat-file/chat-file-ui"
import { showError } from "@/features/globals/global-message-store"
import { Card } from "@/features/ui/card"

import { EasterEgg } from "./chat-easter-egg"
import { ChatSensitivitySelector } from "./chat-sensitivity-selector"
import { ChatStyleSelector } from "./chat-style-selector"
import { ChatTypeSelector } from "./chat-type-selector"
import { PromptButton } from "./prompt-buttons-UI"

interface Prop {}

export const ChatMessageEmptyState: FC<Prop> = () => {
  const { setInput, id, input } = useChatContext()
  const handlePromptSelected = async (prompt: string): Promise<void> => {
    try {
      setInput(prompt)
      const threadResponse = await FindChatThreadForCurrentUser(id)
      if (threadResponse.status !== "OK") throw threadResponse
      const upseted = await UpsertChatThread({ ...threadResponse.response, selectedPrompt: prompt })
      if (upseted.status !== "OK") throw upseted
    } catch (error) {
      showError("Prompt button not selected" + error)
    }
  }

  const { fileState }: { fileState: { showFileUpload: string } } = useChatContext()
  const { showFileUpload } = fileState

  return (
    <div className="max:h-5/6 container mx-auto grid w-full max-w-3xl grid-cols-5 items-center justify-center gap-9 overflow-auto p-4 pb-[80px]">
      <Card className="col-span-5 flex flex-col gap-2 p-5 ">
        <EasterEgg />
        <div className="flex flex-col gap-1">
          <p className="text-sm">Set the Sensitivity of your chat</p>
          <ChatSensitivitySelector disable={false} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm">Choose a conversation style</p>
          <ChatStyleSelector disable={false} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm">How would you like to chat?</p>
          <ChatTypeSelector disable={false} />
        </div>
        {showFileUpload === "data" || showFileUpload === "audio" ? (
          <ChatFileUI />
        ) : (
          <div className="flex flex-col gap-1"></div>
        )}
        <div className="flex flex-col gap-1">
          <br />
          <p className="text-sm">Try a suggested starter prompt...</p>
          <PromptButton onPromptSelected={handlePromptSelected} selectedPrompt={input} />
        </div>
      </Card>
    </div>
  )
}
