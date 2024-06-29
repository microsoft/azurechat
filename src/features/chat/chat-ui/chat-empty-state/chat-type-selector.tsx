import * as Tooltip from "@radix-ui/react-tooltip"
import { AudioLines, FileText, MessageCircle } from "lucide-react"
import React, { useEffect, useState, FC } from "react"

import { APP_NAME } from "@/app-global"

import Typography from "@/components/typography"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { ChatType } from "@/features/chat/models"
import { Tabs, TabsList, TabsTrigger } from "@/features/ui/tabs"
import { TooltipProvider } from "@/features/ui/tooltip-provider"

interface Prop {
  disable: boolean
}

const tenants = process.env.NEXT_PUBLIC_FEATURE_TRANSCRIBE_TENANTS?.split(",") || []

export const ChatTypeSelector: FC<Prop> = ({ disable }) => {
  const { chatBody, onChatTypeChange } = useChatContext()
  const [isAllowedTenant, setIsAllowedTenant] = useState<boolean>(false)

  useEffect(() => {
    if (chatBody) {
      const tenantId = chatBody.tenantId
      setIsAllowedTenant(tenants.includes(tenantId))
    }
  }, [chatBody])

  return (
    <TooltipProvider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div>
            <Tabs
              defaultValue={chatBody.chatType}
              onValueChange={value => {
                onChatTypeChange(value as ChatType)
              }}
            >
              <TabsList aria-label="Conversation Type" className="grid size-full grid-cols-3 items-stretch">
                <TabsTrigger
                  value="simple"
                  className="flex gap-2"
                  disabled={!!chatBody?.chatOverFileName || !!chatBody?.internalReference || disable}
                  role="tab"
                  aria-selected={chatBody.chatType === "simple"}
                  aria-disabled={disable ? "true" : undefined}
                >
                  <MessageCircle size={16} aria-hidden="true" /> General
                </TabsTrigger>
                <TabsTrigger
                  value="data"
                  className="flex gap-2"
                  disabled={!!chatBody?.chatOverFileName || !!chatBody?.internalReference || disable}
                  role="tab"
                  aria-selected={chatBody.chatType === "data"}
                  aria-disabled={disable ? "true" : undefined}
                >
                  <FileText size={16} aria-hidden="true" /> File
                </TabsTrigger>
                <TabsTrigger
                  value="audio"
                  className="flex gap-2"
                  disabled={!isAllowedTenant || disable || !!chatBody?.chatOverFileName}
                  role="tab"
                  aria-selected={chatBody.chatType === "audio"}
                  aria-disabled={!isAllowedTenant || disable ? "true" : undefined}
                >
                  <AudioLines size={16} aria-hidden="true" /> Transcribe
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content side="top" className="rounded-md bg-primary-foreground p-4 text-foreground shadow-lg">
          <Typography variant="p">
            <strong>General</strong> - chats are turn by turn conversations with the {APP_NAME} Assistant.
            <br />
            <strong>File</strong> - Upload PDF files to {APP_NAME} for questions or task completion based on it.
            <br />
            {isAllowedTenant ? (
              <>
                <strong>Transcription</strong> - Available for authorised agencies.
              </>
            ) : (
              <>
                <strong>Transcription</strong> - is restricted to authorised agencies.
              </>
            )}
          </Typography>
          <Tooltip.Arrow className="fill-primary-foreground" />
        </Tooltip.Content>
      </Tooltip.Root>
    </TooltipProvider>
  )
}
