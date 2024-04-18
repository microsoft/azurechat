import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"

import ChatLoading from "@/components/chat/chat-loading"
import ChatRow from "@/components/chat/chat-row"
import { useChatScrollAnchor } from "@/components/hooks/use-chat-scroll-anchor"
import { ChatRole } from "@/features/chat/models"
import { AI_NAME } from "@/features/theme/theme-config"

import { useChatContext } from "./chat-context"
import { ChatHeader } from "./chat-header"

interface Props {
  chatThreadId: string
}

export const ChatMessageContainer: React.FC<Props> = ({ chatThreadId }) => {
  const { data: session } = useSession()
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { messages, isLoading, chatThreadLocked } = useChatContext()

  useChatScrollAnchor(messages, scrollRef)

  useEffect(() => {
    if (!isLoading) {
      router.refresh()
    }
  }, [isLoading, router])

  return (
    <div className="h-full overflow-y-auto bg-altBackground" ref={scrollRef}>
      <div className="flex h-auto justify-center p-4">
        <ChatHeader />
      </div>
      <div className="flex flex-1 flex-col justify-end pb-[80px]">
        {messages.map((message, index) => (
          <ChatRow
            key={message.id}
            chatMessageId={message.id}
            name={message.role === ChatRole.User ? session?.user?.name || "" : AI_NAME}
            message={message}
            type={message.role as ChatRole}
            chatThreadId={chatThreadId}
            showAssistantButtons={index === messages.length - 1 ? !isLoading : true}
            threadLocked={index === messages.length - 1 && chatThreadLocked}
          />
        ))}
        {isLoading && <ChatLoading />}
      </div>
    </div>
  )
}
