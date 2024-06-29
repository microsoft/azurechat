"use client"
import * as Tooltip from "@radix-ui/react-tooltip"
import { CheckIcon, ThumbsUp, ThumbsDown, BookOpenText, CopyCheckIcon, CopyIcon } from "lucide-react"
import React, { useState } from "react"

import Typography from "@/components/typography"
import { CreateUserFeedback } from "@/features/chat/chat-services/chat-message-service"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { ChatSentiment, FeedbackType, PromptMessage } from "@/features/chat/models"
import { showError } from "@/features/globals/global-message-store"
import { AI_NAME } from "@/features/theme/theme-config"
import { Button } from "@/features/ui/button"
import Modal from "@/features/ui/modal"
import { TooltipProvider } from "@/features/ui/tooltip-provider"

import { RewriteMessageButtonProps, RewriteMessageButton } from "./rewrite-message-button"
import { useButtonStyles } from "./use-button-styles"

type AssistantButtonsProps = FeedbackButtonsProps & FleschButtonProps & RewriteMessageButtonProps

export const AssistantButtons: React.FC<AssistantButtonsProps> = ({ fleschScore, message, ...props }) => {
  return (
    <div className="flex w-full gap-2">
      <CopyButton message={message.content} onFeedbackChange={props.onFeedbackChange} />
      <FeedbackButtons
        message={message}
        onFeedbackChange={props.onFeedbackChange}
        chatMessageId={props.chatMessageId}
        chatThreadId={props.chatThreadId}
      />
      <RewriteMessageButton
        fleschScore={fleschScore}
        message={message}
        onAssistantButtonClick={props.onAssistantButtonClick}
      />
      <FleschButton fleschScore={fleschScore} />
    </div>
  )
}

type CopyButtonProps = {
  message: string
  onFeedbackChange: (feedback: string) => void
}
export const CopyButton: React.FC<CopyButtonProps> = ({ message, onFeedbackChange }) => {
  const { iconSize, buttonClass } = useButtonStyles()
  const [copyClicked, setCopyClicked] = useState(false)

  const handleCopyButton = async (): Promise<void> => {
    setCopyClicked(true)
    try {
      const messageWithAttribution = message + ("\n\nText generated by " + AI_NAME)
      await navigator.clipboard.writeText(messageWithAttribution)
      onFeedbackChange("Message copied to clipboard.")
    } catch (_err) {
      onFeedbackChange("Something happened and the message has not been copied.")
    } finally {
      setTimeout(() => {
        onFeedbackChange("")
        setCopyClicked(false)
      }, 2000)
    }
  }

  return (
    <Button
      ariaLabel="Copy text"
      variant={"ghost"}
      size={"default"}
      className={`${buttonClass} ${copyClicked ? "bg-button text-buttonText" : ""}`}
      title="Copy text"
      onClick={handleCopyButton}
    >
      {copyClicked ? <CopyCheckIcon size={iconSize} /> : <CopyIcon size={iconSize} />}
    </Button>
  )
}

type FeedbackButtonsProps = {
  onFeedbackChange: (feedback: string) => void
  message: PromptMessage
  chatMessageId: string
  chatThreadId: string
}
const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  onFeedbackChange,
  message,
  chatMessageId,
  chatThreadId,
}) => {
  const { iconSize, buttonClass } = useButtonStyles()
  const [thumbsUpClicked, setThumbsUpClicked] = useState(message.sentiment === ChatSentiment.Positive)
  const [thumbsDownClicked, setThumbsDownClicked] = useState(message.sentiment === ChatSentiment.Negative)
  const [feedbackType, setFeedbackType] = useState(message.feedback)
  const [feedbackReason, setFeedbackReason] = useState(message.reason)

  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const { openModal, closeModal } = useChatContext()
  const handleThumbsUpClick = async (): Promise<void> => {
    const previous = { thumbsUpClicked, thumbsDownClicked }
    const sentiment = thumbsUpClicked ? ChatSentiment.Neutral : ChatSentiment.Positive
    setThumbsUpClicked(!previous.thumbsUpClicked)
    setThumbsDownClicked(false)
    try {
      const res = await CreateUserFeedback(chatMessageId, FeedbackType.None, sentiment, "", chatThreadId)
      if (res.status !== "OK") throw new Error("Failed to submit feedback.")
      const message = "Positive feedback submitted."
      onFeedbackChange(message)
      setTimeout(() => onFeedbackChange(""), 2000)
    } catch (err) {
      setThumbsUpClicked(previous.thumbsUpClicked)
      setThumbsDownClicked(previous.thumbsDownClicked)
      const error = err instanceof Error ? err.message : typeof err === "string" ? err : "Failed to submit feedback."
      showError(error)
      onFeedbackChange(error)
      setTimeout(() => onFeedbackChange(""), 2000)
    }
  }

  const handleThumbsDownClick = (): void => {
    setFeedbackModalOpen(true)
    openModal?.()
  }

  const handleFeedbackModalSubmit = async (): Promise<void> => {
    const previous = { thumbsUpClicked, thumbsDownClicked }
    const sentiment = thumbsDownClicked ? ChatSentiment.Neutral : ChatSentiment.Negative
    setThumbsUpClicked(false)
    setThumbsDownClicked(!previous.thumbsDownClicked)
    try {
      const res = await CreateUserFeedback(
        chatMessageId,
        feedbackType || FeedbackType.None,
        sentiment,
        (feedbackReason || "").trim(),
        chatThreadId
      )
      if (res.status !== "OK") throw new Error("Failed to submit feedback.")
      const message = "Negative feedback submitted."
      setFeedbackType(FeedbackType.None)
      setFeedbackReason("")
      onFeedbackChange(message)
      setTimeout(() => onFeedbackChange(""), 2000)
      setFeedbackModalOpen(false)
      closeModal?.()
    } catch (_err) {
      setThumbsUpClicked(previous.thumbsUpClicked)
      setThumbsDownClicked(previous.thumbsDownClicked)
      const error = "Failed to submit feedback."
      showError(error)
      onFeedbackChange(error)
      setTimeout(() => onFeedbackChange(""), 2000)
    }
  }

  const handleFeedbackModalClose = (): void => {
    setFeedbackType(FeedbackType.None)
    setFeedbackReason("")
    setFeedbackModalOpen(false)
    closeModal?.()
  }
  return (
    <>
      <Button
        variant={"positive"}
        size={"default"}
        className={`${buttonClass} ${thumbsUpClicked ? "bg-success text-buttonText" : ""}`}
        title="Thumbs up"
        onClick={handleThumbsUpClick}
        ariaLabel="Provide positive feedback"
      >
        {thumbsUpClicked ? <CheckIcon size={iconSize} /> : <ThumbsUp size={iconSize} />}
      </Button>

      <Button
        variant={"negative"}
        size={"default"}
        className={`${buttonClass} ${thumbsDownClicked ? "bg-destructive" : ""}`}
        title="Thumbs down"
        onClick={handleThumbsDownClick}
        ariaLabel="Provide negative feedback"
      >
        {thumbsDownClicked ? <CheckIcon size={iconSize} /> : <ThumbsDown size={iconSize} />}
      </Button>
      <Modal
        chatThreadId={chatThreadId}
        chatMessageId={chatMessageId}
        feedbackType={feedbackType}
        onFeedbackTypeChange={setFeedbackType}
        feedbackReason={feedbackReason}
        onFeedbackReasonChange={setFeedbackReason}
        open={isFeedbackModalOpen}
        onClose={handleFeedbackModalClose}
        onSubmit={handleFeedbackModalSubmit}
      />
    </>
  )
}

type FleschButtonProps = {
  fleschScore: number
}
const FleschButton: React.FC<FleschButtonProps> = ({ fleschScore }) => {
  const { iconSize } = useButtonStyles()

  return (
    <TooltipProvider>
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger className="relative flex w-full items-center justify-center gap-4 rounded-md px-2 hover:bg-accent hover:text-buttonText">
          <div className="flex items-center justify-center gap-2">
            <BookOpenText size={iconSize} />
            {fleschScore}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content
          side="top"
          className="z-20 rounded-md bg-primary-foreground px-4 py-2 text-foreground shadow-lg"
        >
          <Typography variant="p">
            <strong>Flesch-Kincaid Score (KFKS):</strong> The Flesch-Kincaid Score below shows
            <br />
            how easy or difficult it is to understand the writing.
            <br /> The higher the score, the more difficult it is to read.
            <br />
            Aim for a score of <strong>8</strong> to make sure most people find the message clear.
            <br />
            This includes younger readers and those who are still learning English.
          </Typography>
        </Tooltip.Content>
      </Tooltip.Root>
    </TooltipProvider>
  )
}