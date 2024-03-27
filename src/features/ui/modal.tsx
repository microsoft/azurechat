import React, { FC, useState, useRef } from "react"
import Typography from "@/components/typography"
import { FeedbackTextarea } from "./feedback-textarea"
import FeedbackButtons from "./feedback-reasons"
import { Button } from "./button"
import { ChatSentiment, FeedbackType } from "@/features/chat/models"
import { CreateUserFeedback } from "../chat/chat-services/chat-message-service"
import { showError } from "../globals/global-message-store"

interface ModalProps {
  chatThreadId: string
  chatMessageId: string
  open: boolean
  onClose: () => void
  onSubmit: (chatMessageId: string, feedback: string, reason: string, chatThreadId: string) => void
}

export default function Modal(props: ModalProps): ReturnType<FC> {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(FeedbackType.None)
  const [feedbackReason, setFeedbackReason] = useState("")
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [areTabsEnabled, setTabsEnabled] = useState<boolean>(false)

  const textareaId = `chatMessageFeedback-${props.chatMessageId}`
  const textareaName = `chatMessageFeedback-${props.chatMessageId}`

  function handleFeedbackReasonChange(): void {
    const textareaValue = textAreaRef.current?.value || ""
    if (!areTabsEnabled) setTabsEnabled(true)
    setFeedbackReason(textareaValue)
  }

  async function handleSubmit(): Promise<void> {
    props.onSubmit(props.chatMessageId, feedbackType, feedbackReason, props.chatThreadId)
    const response = await CreateUserFeedback(
      props.chatMessageId,
      feedbackType,
      ChatSentiment.Negative,
      feedbackReason,
      props.chatThreadId
    )
    if (response.status !== "OK") showError("Failed to submit feedback")
    setFeedbackReason("")
    props.onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedbackHeading"
      className={`fixed inset-0 flex items-center justify-center bg-black ${props.open ? "block" : "hidden"}`}
    >
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-lg bg-background p-4">
        <div className="mb-4">
          <Typography id="feedbackHeading" variant="h4" className="text-primary">
            Submit your feedback
          </Typography>
        </div>
        <div className="mb-4">
          <FeedbackTextarea
            id={textareaId}
            name={textareaName}
            aria-label="Enter your feedback"
            placeholder="Please provide any additional details about the message or your feedback, our team will not reply directly but it will assist us in improving our service."
            ref={textAreaRef}
            rows={6}
            className="w-full rounded border border-gray-300 bg-background p-4"
            onChange={handleFeedbackReasonChange}
          />
        </div>
        <FeedbackButtons areTabsEnabled={areTabsEnabled} onFeedbackTypeChange={setFeedbackType} />
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="default" onClick={handleSubmit}>
            Submit
          </Button>
          <Button variant="secondary" onClick={props.onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
