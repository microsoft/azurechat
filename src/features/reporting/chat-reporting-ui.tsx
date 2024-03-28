import ChatRow from "@/components/chat/chat-row"
import { Card } from "@/features/ui/card"
import { FC } from "react"
import { AI_NAME } from "../theme/theme-config"
import { FindAllChatsInThread, FindChatThreadById } from "./reporting-service"
import { ChatMessageModel, ChatRole } from "../chat/models"

interface Props {
  chatThreadId: string
}

export const ChatReportingUI: FC<Props> = async props => {
  const [chatThreads, chats] = await Promise.all([
    FindChatThreadById(props.chatThreadId),
    FindAllChatsInThread(props.chatThreadId),
  ])
  if (chatThreads.status !== "OK") return <div>Error</div>
  if (chats.status !== "OK") return <div>Error</div>

  const chatThread = chatThreads.response

  return (
    <Card className="relative h-full">
      <div className="h-full overflow-y-auto rounded-md">
        <div className="flex justify-center p-4"></div>
        <div className="pb-[80px]">
          {chats.response?.map((message, index) => {
            return (
              <ChatRow
                chatMessageId={message.id}
                name={message.role === ChatRole.User ? chatThread.useName : AI_NAME}
                message={message}
                type={message.role as ChatRole}
                key={index}
                chatThreadId={props.chatThreadId}
                contentSafetyWarning={message as unknown as ChatMessageModel["contentSafetyWarning"]}
              />
            )
          })}
        </div>
      </div>
    </Card>
  )
}
