"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { FC, useEffect, useRef, useState } from "react"

import { APP_NAME } from "@/app-global"

import { ChatFileTranscription } from "@/components/chat/chat-file-transcription"
import { ChatFileView } from "@/components/chat/chat-file-view"
import ChatLoading from "@/components/chat/chat-loading"
import ChatRow from "@/components/chat/chat-row"
import TranscriptEditorProvider from "@/components/chat/chat-transcript-editor/transcript-editor-provider"
import { useChatScrollAnchor } from "@/components/hooks/use-chat-scroll-anchor"

import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { ChatHeader } from "@/features/chat/chat-ui/chat-header"
import { ChatRole } from "@/features/chat/models"
import { Button } from "@/features/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/features/ui/tabs"

interface Props {
  chatThreadId: string
}
export const ReportingMessageContainer: FC<Props> = ({ chatThreadId }) => {
  const { data: session } = useSession()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { messages, documents, isLoading, chatThreadLocked } = useChatContext()
  const [selectedTab, setSelectedTab] = useState<SectionTabsProps["selectedTab"]>("chat")

  useChatScrollAnchor(messages, scrollRef, true)

  useEffect(() => {
    if (isLoading) return
    setSelectedTab("chat")
  }, [isLoading])

  const chatFiles = documents.filter(document => document.contents)

  return (
    <div className="h-full overflow-y-auto" ref={scrollRef}>
      <div className="container my-4 flex items-center justify-between">
        <Button asChild variant="outline" ariaLabel="Back to Reporting">
          <Link href={"/settings/history"}>Back to Reporting</Link>
        </Button>
        <ChatHeader />
        <Button asChild variant="outline" ariaLabel="Access chat">
          <Link href={`/chat/${chatThreadId}`}>{chatThreadLocked ? "Continue this chat" : "View this chat"}</Link>
        </Button>
      </div>
      {chatFiles.length ? <SectionTabs selectedTab={selectedTab} onSelectedTabChange={setSelectedTab} /> : undefined}
      <div className="flex flex-1 flex-col justify-end pb-[140px]">
        {selectedTab === "chat"
          ? messages.map((message, index) => (
              <ChatRow
                key={message.id}
                chatMessageId={message.id}
                name={message.role === ChatRole.User ? session?.user?.name || "" : APP_NAME}
                message={message}
                type={message.role as ChatRole}
                chatThreadId={chatThreadId}
                showAssistantButtons={index === messages.length - 1 ? !isLoading : true}
                lockMessage={index === messages.length - 1 && chatThreadLocked}
                disableButtons={true}
              />
            ))
          : selectedTab === "transcription"
            ? chatFiles.map(document => (
                <TranscriptEditorProvider
                  key={document.id}
                  originalContent={document.contents}
                  updatedContent={document.updatedContents}
                >
                  <ChatFileTranscription
                    key={document.id}
                    chatThreadId={chatThreadId}
                    documentId={document.id}
                    name={document.name}
                    vtt={document.extraContents || ""}
                  />
                </TranscriptEditorProvider>
              ))
            : selectedTab === "document"
              ? chatFiles.map(document => (
                  <ChatFileView key={document.id} name={document.name} contents={document.contents || ""} />
                ))
              : null}
        {isLoading && <ChatLoading />}
      </div>
    </div>
  )
}
interface SectionTabsProps {
  selectedTab: "chat" | "transcription" | "document"
  onSelectedTabChange: (value: SectionTabsProps["selectedTab"]) => void
}
const SectionTabs: FC<SectionTabsProps> = ({ selectedTab, onSelectedTabChange }) => {
  const { chatBody } = useChatContext()
  return (
    <Tabs value={selectedTab} onValueChange={onSelectedTabChange as (x: string) => void} className="container pb-2">
      <TabsList aria-label="Conversation Type" className="grid size-full grid-cols-2 items-stretch">
        <TabsTrigger value="chat" className="flex gap-2" role="tab" aria-selected={selectedTab === "chat"}>
          Chat
        </TabsTrigger>
        {chatBody.chatType === "audio" && (
          <TabsTrigger
            value="transcription"
            className="flex gap-2"
            role="tab"
            aria-selected={selectedTab === "transcription"}
          >
            Transcription
          </TabsTrigger>
        )}
        {chatBody.chatType === "data" && (
          <TabsTrigger value="document" className="flex gap-2" role="tab" aria-selected={selectedTab === "document"}>
            Document
          </TabsTrigger>
        )}
      </TabsList>
    </Tabs>
  )
}
