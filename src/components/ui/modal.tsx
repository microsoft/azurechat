import React, { FC, useState, useRef, useEffect } from "react";
import Typography from "@/components/typography";
import { FeedbackTextarea } from "./feedback-textarea";
import FeedbackButtons from './feedback-reasons';
import { Button } from "./button";
import { CreateUserFeedbackChatId } from "@/features/chat/chat-services/chat-service";
import { ChatSentiment } from "@/features/chat/chat-services/models";

interface ModalProps {
    chatThreadId: string;
    open: boolean;
    onClose: () => void;
    onSubmit: (chatMessageId: string, feedback: string, reason: string, threadId: string) => void;
}

export default function Modal(props: ModalProps): ReturnType<FC> {
    const [feedback, setFeedback] = useState<string>(''); 
    const [reason, setReason] = useState(""); 
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [areTabsEnabled, setTabsEnabled] = useState<boolean>(false);

    const textareaId = `chatMessageFeedback-${props.chatThreadId}`;
    const textareaName = `chatMessageFeedback-${props.chatThreadId}`;

    async function handleFeedbackChange(): Promise<void> {
      const textareaValue = textAreaRef.current?.value || "";
      if (!areTabsEnabled) {
        setTabsEnabled(true);
      }
      setFeedback(textareaValue);
    };

    const handleReasonChange = (reason: string) => {
      setReason(reason);
    };

    async function handleSubmit(): Promise<void> {
      props.onSubmit(props.chatThreadId, feedback, reason, props.chatThreadId); 
      setFeedback('');
      CreateUserFeedbackChatId(props.chatThreadId, feedback, ChatSentiment.Negative, reason, props.chatThreadId);
      props.onClose(); 
    };

    return (
      <div role="dialog" aria-modal="true" aria-labelledby="feedbackHeading" className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${props.open ? "block" : "hidden"}`}>
            <div className="bg-background w-full max-w-lg mx-auto rounded-lg p-4 overflow-hidden">
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
                        className="w-full p-4 bg-background border border-gray-300 rounded"
                        onChange={() => handleFeedbackChange()}
                    />
                </div>
                <FeedbackButtons
                    areTabsEnabled={areTabsEnabled}
                    onReasonChange={handleReasonChange}
                />
                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="default" onClick={handleSubmit}>Submit</Button>
                  <Button variant="secondary" onClick={props.onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
}
