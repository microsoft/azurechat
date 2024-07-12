import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { ReactNode } from "react"

import { APP_NAME } from "@/app-global"

import { FindAllChatDocumentsForCurrentUser } from "@/features/chat/chat-services/chat-document-service"
import { FindAllChatMessagesForCurrentUser } from "@/features/chat/chat-services/chat-message-service"
import { FindChatThreadForCurrentUser } from "@/features/chat/chat-services/chat-thread-service"
import ChatProvider from "@/features/chat/chat-ui/chat-context"
import { GetTenantPreferences } from "@/features/tenant-management/tenant-service"

export const dynamic = "force-dynamic"

export const metadata = {
  title: `${APP_NAME} Thread`,
  description: `${APP_NAME} - Thread`,
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { chatThreadId: string }
}): Promise<JSX.Element> {
  const session = await getServerSession()
  if (!session) return redirect("/")

  const [messages, thread, documents, preferences] = await Promise.all([
    FindAllChatMessagesForCurrentUser(params.chatThreadId),
    FindChatThreadForCurrentUser(params.chatThreadId),
    FindAllChatDocumentsForCurrentUser(params.chatThreadId),
    GetTenantPreferences(),
  ])

  if (thread.status !== "OK" || messages.status !== "OK" || documents.status !== "OK" || preferences.status !== "OK")
    return redirect("/")

  return (
    <ChatProvider
      id={params.chatThreadId}
      chats={messages.response}
      chatThread={thread.response}
      documents={documents.response}
      tenantPreferences={preferences.response}
    >
      {children}
    </ChatProvider>
  )
}
