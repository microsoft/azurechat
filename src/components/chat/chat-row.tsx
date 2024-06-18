"use client"

import { OctagonAlert, SearchX } from "lucide-react"
import React, { FC, useState } from "react"

import ErrorBoundary from "@/components/error-boundary"
import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { calculateFleschKincaidScore } from "@/features/chat/chat-services/chat-flesch"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { ChatRole, PromptMessage } from "@/features/chat/models"
import { AssistantButtons } from "@/features/ui/assistant-buttons"
import { RewriteMessageButton } from "@/features/ui/assistant-buttons/rewrite-message-button"

interface ChatRowProps {
  chatMessageId: string
  name: string
  message: PromptMessage
  type: ChatRole
  chatThreadId: string
  showAssistantButtons: boolean
  threadLocked?: boolean
}

export const ChatRow: FC<ChatRowProps> = props => {
  const { setInput } = useChatContext()
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const content =
    props.type === "assistant" ? props.message.content : `**${props.name || "You"}**: ${props.message.content}`

  const fleschScore = calculateFleschKincaidScore(props.message.content)

  return (
    <article className={"container mx-auto flex flex-col py-1 pb-2"}>
      <ErrorBoundary fallback={<ErrorSection />}>
        <section
          className={`prose prose-slate max-w-full flex-col gap-4 overflow-hidden break-words rounded-md px-4 py-2 text-base text-text dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 md:text-base ${props.threadLocked && "border-4 border-error"} ${props.type === "assistant" && "bg-backgroundShade"} ${props.type != "assistant" && "bg-altBackgroundShade"}`}
        >
          {props.type === "assistant" && (
            <div className="flex w-full items-center justify-between">
              <Typography variant="h3" className="m-0 flex-1 text-heading" tabIndex={0}>
                {props.name}
              </Typography>
              <div className="flex items-center gap-4">
                {props.showAssistantButtons && (
                  <AssistantButtons
                    fleschScore={fleschScore}
                    message={props.message}
                    chatThreadId={props.chatThreadId}
                    chatMessageId={props.chatMessageId}
                    onFeedbackChange={setFeedbackMessage}
                    onAssistantButtonClick={(result: string) => setInput(result)}
                  />
                )}
              </div>
            </div>
          )}
          <div
            className="prose prose-slate max-w-full break-words text-base text-text dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 md:text-base"
            tabIndex={0}
          >
            <div className="size-full items-center justify-between">
              <Markdown content={content} />
              {!!props.message.contentFilterResult && (
                <RewriteMessageButton
                  fleschScore={fleschScore}
                  message={props.message}
                  onAssistantButtonClick={(result: string) => setInput(result)}
                />
              )}
            </div>
          </div>
          {!!props.message?.contentFilterResult && (
            <div
              className="my-2 flex max-w-none justify-center space-x-2 rounded-md bg-alert p-2 text-base text-primary md:text-base"
              tabIndex={0}
              aria-label="Content Safety Warning"
            >
              <div className="flex items-center justify-center">
                <OctagonAlert size={20} />
              </div>
              <div className="flex flex-grow items-center justify-center text-center">
                This message has triggered our content safety warnings, please rephrase your message, start a new chat
                or reach out to support if you have concerns.
              </div>
              <div className="flex items-center justify-center">
                <OctagonAlert size={20} />
              </div>
            </div>
          )}
          <div className="sr-only" aria-live="assertive">
            {feedbackMessage}
          </div>
        </section>
      </ErrorBoundary>
    </article>
  )
}
export default ChatRow

const ErrorSection = (): JSX.Element => (
  <div
    className="my-2 flex max-w-none justify-center space-x-2 rounded-md bg-backgroundShade p-2 text-base text-text md:text-base"
    tabIndex={0}
  >
    <div className="flex items-center justify-center text-alert">
      <SearchX size={20} />
    </div>
    <div className="flex flex-grow items-center justify-center text-center">
      Oops! Looks like there&apos;s a hiccup, and we can&apos;t show the response right now. But no worries, feel free
      to keep the conversation going!
    </div>
    <div className="flex items-center justify-center text-alert">
      <SearchX size={20} />
    </div>
  </div>
)
