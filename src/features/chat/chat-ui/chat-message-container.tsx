import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import ChatLoading from "@/components/chat/chat-loading"
import ChatRow from "@/components/chat/chat-row"
import { useSession } from "next-auth/react"
import { useChatContext } from "./chat-context"
import { ChatHeader } from "./chat-header"
import { ChatRole } from "../models"
import { useChatScrollAnchor } from "@/components/hooks/use-chat-scroll-anchor"
import { AI_NAME } from "@/features/theme/theme-config"

interface Props {
  chatThreadId: string
}

export const ChatMessageContainer: React.FC<Props> = ({ chatThreadId }) => {
  const { data: session } = useSession()
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { messages, isLoading } = useChatContext()

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
      <div className="flex h-auto flex-1 flex-col justify-end pb-[80px]">
        {messages.map((message, index) => (
          <ChatRow
            chatMessageId={message.id}
            name={message.role === ChatRole.User ? session?.user?.name || "" : AI_NAME}
            message={message.content}
            type={message.role as ChatRole}
            key={index}
            chatThreadId={chatThreadId}
            contentSafetyWarning={undefined}
            feedback={undefined}
            sentiment={undefined}
            reason={undefined}
          />
        ))}
        {isLoading && <ChatLoading />}
      </div>
    </div>
  )
}
