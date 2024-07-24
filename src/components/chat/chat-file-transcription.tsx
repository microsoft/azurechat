"use client"

import { DownloadIcon, CaptionsIcon, FileTextIcon, SaveIcon } from "lucide-react"
import { FC, useCallback, useState } from "react"

import { APP_NAME } from "@/app-global"

import Typography from "@/components/typography"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import {
  convertTranscriptionToWordDocument,
  convertTranscriptionReportToWordDocument,
} from "@/features/common/file-export"
import { showSuccess, showError } from "@/features/globals/global-message-store"
import { CopyButton } from "@/features/ui/assistant-buttons"
import { CheckTranscriptionButton } from "@/features/ui/assistant-buttons/rewrite-message-button"
import { useButtonStyles } from "@/features/ui/assistant-buttons/use-button-styles"
import { Button } from "@/features/ui/button"

import { ChatTranscriptEditor } from "./chat-transcript-change"
import { useTranscriptEditor } from "./chat-transcript-editor/transcript-editor-provider"

interface ChatFileTranscriptionProps {
  chatThreadId: string
  documentId: string
  name: string
  vtt: string
}
export const ChatFileTranscription: FC<ChatFileTranscriptionProps> = props => {
  const { content, reset, undo, save } = useTranscriptEditor()

  const { chatBody, setInput } = useChatContext()
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const fileTitle = props.name.replace(/[^a-zA-Z0-9]/g, " ").trim()
  const showTranscriptWithSpeakers = "**Speaker:** " + content.replace(/\n/g, "\n\n**Speaker:** ")

  const onDownloadTranscription = useCallback(async (): Promise<void> => {
    const fileName = `${fileTitle}-transcription.docx`
    const chatThreadName = chatBody.chatThreadName || `${APP_NAME} ${fileName}`
    await convertTranscriptionToWordDocument([content], props.name, fileName, APP_NAME, chatThreadName)
  }, [content, props.name, chatBody.chatThreadName, fileTitle])

  const onDownloadReport = useCallback(async (): Promise<void> => {
    const fileName = `${fileTitle}-report.docx`
    await convertTranscriptionReportToWordDocument([content], fileName)
  }, [fileTitle, content])

  const onDownloadVttFile = useCallback((): void => {
    const element = document.createElement("a")
    element.setAttribute("href", `data:text/plain;base64,${toBinaryBase64(props.vtt ?? "")}`)
    element.setAttribute("download", `${fileTitle}-transcription.vtt`)
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }, [fileTitle, props.vtt])

  const { iconSize, buttonClass } = useButtonStyles()

  const handleSave = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/chat/${props.chatThreadId}/document/${props.documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedContent: content }),
      })
      if (!response.ok) throw new Error("Failed to save document.")
      save()
      showSuccess({ title: "Document saved successfully" })
    } catch (err) {
      const error = err instanceof Error ? err.message : "Something went wrong and the document has not been saved."
      showError(error)
    }
  }

  return (
    <div className="container mx-auto flex flex-col py-1 pb-4">
      <div className="flex-col gap-4 overflow-hidden rounded-md bg-background p-4">
        <div className="flex w-full items-center">
          <Typography variant="h3" className="flex-1">
            Transcription of: <b>{props.name}</b>
          </Typography>
          <div className="flex flex-1 justify-between">
            <div className="flex gap-2">
              <Button variant="destructive" onClick={reset} ariaLabel="Reset from original" className={buttonClass}>
                Reset
              </Button>
              <Button
                variant="outline"
                onClick={undo}
                className={`${buttonClass} hover:bg-error`}
                ariaLabel="Reset from latest update"
              >
                Undo
              </Button>
              <Button
                variant="accent"
                onClick={handleSave}
                ariaLabel="Save changes"
                className={`${buttonClass} flex gap-2`}
              >
                <SaveIcon size={iconSize} />
                Save
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                ariaLabel="Download Transcription"
                variant={"ghost"}
                size={"default"}
                className={buttonClass}
                title="Download Transcription"
                onClick={onDownloadTranscription}
              >
                <DownloadIcon size={iconSize} />
              </Button>
              <Button
                ariaLabel="Download Report"
                variant={"ghost"}
                size={"default"}
                className={buttonClass}
                title="Download Report"
                onClick={onDownloadReport}
              >
                <FileTextIcon size={iconSize} />
              </Button>
              {props.vtt.length && (
                <Button
                  ariaLabel="Download WebVTT subtitles file"
                  variant={"ghost"}
                  size={"default"}
                  className={buttonClass}
                  title="Download WebVTT subtitles file"
                  onClick={onDownloadVttFile}
                >
                  <CaptionsIcon size={iconSize} />
                </Button>
              )}
              <CheckTranscriptionButton transcription={showTranscriptWithSpeakers} onAssistantButtonClick={setInput} />
              <CopyButton message={showTranscriptWithSpeakers} onFeedbackChange={setFeedbackMessage} />
            </div>
          </div>
        </div>
        <ChatTranscriptEditor />
        <div className="sr-only" aria-live="assertive">
          {feedbackMessage}
        </div>
      </div>
    </div>
  )
}

const toBinaryBase64 = (text: string): string => {
  const codeUnits = new Uint16Array(text.length)
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = text.charCodeAt(i)
  }

  return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)))
}
