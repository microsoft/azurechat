import { FC } from "react"
import { useChatContext } from "../chat-context"
import { Tabs, TabsList, TabsTrigger } from "@/features/ui/tabs"
import {
  getSensitivityIcon,
  getStyleIcon,
  getTypeIcon,
  formatSensitivityValue,
  formatStyleValue,
  formatTypeValue,
} from "./icon-helpers"

interface Prop {}

export const ChatSelectedOptions: FC<Prop> = () => {
  const { chatBody } = useChatContext()

  return (
    <div className="hidden sm:block">
      <Tabs defaultValue="selected" aria-label="Selected Chat Options">
        <TabsList className="grid h-12 w-full grid-cols-1 items-stretch" tabIndex={0}>
          <TabsTrigger
            value="selected"
            className="flex items-center justify-center gap-2"
            disabled={true}
            aria-disabled="true"
          >
            {getSensitivityIcon(chatBody.conversationSensitivity)}
            <span className="mx-1">{formatSensitivityValue(chatBody.conversationSensitivity)}</span>
            {getStyleIcon(chatBody.conversationStyle)}
            <span className="mx-1">{formatStyleValue(chatBody.conversationStyle)}</span>
            {getTypeIcon(chatBody.chatType)}
            <span className="mx-1">{formatTypeValue(chatBody.chatType)}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
