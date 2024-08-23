"use client"

import { OctagonAlert, SearchX, SmilePlus } from "lucide-react"
import React, { FC, useState } from "react"

import ErrorBoundary from "@/components/error-boundary"
import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { calculateFleschKincaidScore } from "@/features/chat/chat-services/chat-flesch"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { SHORT_MESSAGE_LENGTH } from "@/features/chat/constants"
import { ChatRole, ContentFilterResult, ContentFilterResultCategory, PromptMessage } from "@/features/chat/models"
import { AssistantButtons } from "@/features/ui/assistant-buttons"
import { RewriteMessageButton } from "@/features/ui/assistant-buttons/rewrite-message-button"

interface ChatRowProps {
  chatMessageId: string
  name: string
  message: PromptMessage
  type: ChatRole
  chatThreadId: string
  showAssistantButtons: boolean
  lockMessage?: boolean
  disableButtons?: boolean
}

export const ChatRow: FC<ChatRowProps> = props => {
  const { setInput, chatThreadLocked } = useChatContext()
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const content =
    props.type === "assistant" ? props.message.content : `**${props.name || "You"}**: ${props.message.content}`

  const fleschScore = calculateFleschKincaidScore(props.message.content)

  const isShortInput = (text: string): boolean => text.length < SHORT_MESSAGE_LENGTH
  const makeMessage = (result: ContentFilterResult): string => {
    const categories: string[] = []
    Object.keys(result).forEach(element => {
      const category = (result as unknown as { [value: string]: string })[
        element
      ] as unknown as ContentFilterResultCategory
      if (category.filtered) {
        categories.push(element.replace("_", " "))
      }
    })

    return categories.join(", ")
  }

  return (
    <article className={"container mx-auto flex flex-col py-1 pb-2"}>
      <ErrorBoundary fallback={<ErrorSection />}>
        <section
          className={`prose prose-slate max-w-full flex-col gap-4 overflow-hidden break-words rounded-md px-4 py-2 text-base text-text dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 md:text-base ${props.lockMessage && "border-4 border-error"} ${props.type === "assistant" && "bg-backgroundShade"} ${props.type != "assistant" && "bg-altBackgroundShade"}`}
        >
          {props.type === "assistant" && (
            <div className="flex w-full items-center justify-between">
              <Typography variant="h3" className="m-0 flex-1 text-heading" tabIndex={0}>
                {props.name}
              </Typography>
              <div className="flex items-center gap-4">
                {props.showAssistantButtons && !props.disableButtons && (
                  <AssistantButtons
                    fleschScore={fleschScore}
                    message={props.message}
                    chatThreadId={props.chatThreadId}
                    chatMessageId={props.chatMessageId}
                    onFeedbackChange={setFeedbackMessage}
                    onAssistantButtonClick={setInput}
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
              {!!props.message.contentFilterResult && !props.disableButtons && !chatThreadLocked && (
                <RewriteMessageButton
                  fleschScore={fleschScore}
                  message={props.message}
                  onAssistantButtonClick={setInput}
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
                This message or the reply that could have been generated has triggered a content safety warning and may be considered harmful content related to{" "}
                {makeMessage(props.message?.contentFilterResult.innererror.content_filter_result)}, please consider providing additional context, try rephrasing your
                message, start a new chat or please reach out to support if you believe you have received this in error.
              </div>
              <div className="flex items-center justify-center">
                <OctagonAlert size={20} />
              </div>
            </div>
          )}
          {props.type !== "assistant" && isShortInput(props.message.content) && (
            <div
              className="my-2 flex max-w-none justify-center space-x-2 rounded-md bg-information p-2 text-base md:text-base"
              tabIndex={0}
              aria-label="Input Warning"
            >
              <div className="flex items-center justify-center">
                <SmilePlus size={20} />
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                Your message is a bit short. For the best results, please provide more context or details.
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
