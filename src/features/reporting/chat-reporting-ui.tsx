import { FC } from "react"

import { ReportingMessageContainer } from "@/features/reporting/reporting-message-container"
import { Card } from "@/features/ui/card"

import { FindAllChatsInThread, FindChatThreadById } from "./reporting-service"

interface Props {
  chatThreadId: string
}

export const ChatReportingUI: FC<Props> = async ({ chatThreadId }) => {
  const [chatThread, chats] = await Promise.all([FindChatThreadById(chatThreadId), FindAllChatsInThread(chatThreadId)])
  if (chatThread.status !== "OK") return <div>Error</div>
  if (chats.status !== "OK") return <div>Error</div>

  return (
    <Card className="relative h-full">
      {chats.response.length !== 0 ? (
        <ReportingMessageContainer chatThreadId={chatThreadId} />
      ) : (
        <div>No messages or documents to display.</div>
      )}
    </Card>
  )
}
