import { notFound } from "next/navigation"

import { FindAllChatMessagesForCurrentUser } from "@/features/chat/chat-services/chat-message-service"
import { FindChatThreadForCurrentUser } from "@/features/chat/chat-services/chat-thread-service"
import { ChatProvider } from "@/features/chat/chat-ui/chat-context"
import { ChatUI } from "@/features/chat/chat-ui/chat-ui"

export const dynamic = "force-dynamic"

export default async function Home({ params }: { params: { chatThreadId: string } }): Promise<JSX.Element> {
  const [messages, thread] = await Promise.all([
    FindAllChatMessagesForCurrentUser(params.chatThreadId),
    FindChatThreadForCurrentUser(params.chatThreadId),
  ])

  if (thread.status !== "OK" || messages.status !== "OK") return notFound()

  return (
    <ChatProvider id={params.chatThreadId} chats={messages.response} chatThread={thread.response}>
      <ChatUI />
    </ChatProvider>
  )
}
