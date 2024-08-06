import React, { FC, useState } from "react"

import { ChatSentiment, FeedbackType } from "@/features/chat/models"
import { Button } from "@/features/ui/button"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/features/ui/dialog"
import FeedbackButtons from "@/features/ui/feedback-reasons"
import { FeedbackTextarea } from "@/features/ui/feedback-textarea"
interface FeedbackModalProps {
  chatThreadId: string
  chatMessageId: string
  feedbackType?: FeedbackType
  feedbackReason?: string
  onClose: () => void
  onSubmit: (feedbackSentiment: ChatSentiment, feedbackType: FeedbackType, feedbackReason: string) => Promise<void>
}

export default function FeedbackModal(props: FeedbackModalProps): ReturnType<FC> {
  const [feedbackType, setFeedbackType] = useState(props.feedbackType || FeedbackType.None)
  const [feedbackReason, setFeedbackReason] = useState(props.feedbackReason || "")

  return (
    <Dialog onClose={props.onClose}>
      <DialogHeader>Submit your feedback</DialogHeader>
      <DialogContent className="flex flex-col gap-4">
        <FeedbackTextarea
          name={props.chatMessageId + "Feedback text"}
          id={props.chatMessageId + "Feedback text id"}
          aria-label="Enter your feedback"
          placeholder="Please provide any additional details about the message or your feedback, our team will not reply directly but it will assist us in improving our service. If you believe a serious issue has occurred please contact support directly."
          rows={4}
          className="gp-4 w-full rounded border border-gray-300 bg-background"
          value={feedbackReason}
          onChange={event => setFeedbackReason(event.target.value)}
        />
        <FeedbackButtons selectedType={feedbackType ?? FeedbackType.None} onFeedbackTypeChange={setFeedbackType} />
      </DialogContent>
      <DialogFooter>
        <Button
          variant="default"
          ariaLabel="Submit feedback"
          onClick={async () => {
            await props.onSubmit(ChatSentiment.Negative, feedbackType, feedbackReason)
            props.onClose()
          }}
          disabled={!(feedbackReason || "").trim()}
        >
          Submit
        </Button>
        <Button variant="secondary" onClick={props.onClose} ariaLabel="Close">
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
