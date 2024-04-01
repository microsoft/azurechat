import React, { FC } from "react"
import Typography from "@/components/typography"
import { FeedbackTextarea } from "./feedback-textarea"
import FeedbackButtons from "./feedback-reasons"
import { Button } from "./button"
import { FeedbackType } from "@/features/chat/models"

interface ModalProps {
  chatThreadId: string
  chatMessageId: string
  feedbackType?: FeedbackType
  onFeedbackTypeChange: (FeedbackType: FeedbackType) => void
  feedbackReason?: string
  onFeedbackReasonChange: (text: string) => void
  open: boolean
  onClose: () => void
  onSubmit: () => void
}

export default function Modal(props: ModalProps): ReturnType<FC> {
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
            name={props.chatMessageId + "Feedback text"}
            id={props.chatMessageId + "Feedback text id"}
            aria-label="Enter your feedback"
            placeholder="Please provide any additional details about the message or your feedback, our team will not reply directly but it will assist us in improving our service."
            rows={6}
            className="w-full rounded border border-gray-300 bg-background p-4"
            value={props.feedbackReason}
            onChange={event => props.onFeedbackReasonChange(event.target.value)}
          />
        </div>

        <FeedbackButtons
          selectedType={props.feedbackType ?? FeedbackType.None}
          onFeedbackTypeChange={props.onFeedbackTypeChange}
        />
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="default"
            onClick={props.onSubmit}
            disabled={(props.feedbackReason || "").trim().length === 0}
          >
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
