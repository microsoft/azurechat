import { DownloadIcon, CaptionsIcon, FileTextIcon } from "lucide-react"
import { FC, useCallback, useState, useEffect } from "react"

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

interface ChatFileTranscriptionProps {
  chatThreadId: string
  documentId: string
  name: string
  contents: string
  updatedContents: string
  accuracy: number
  vtt: string
}

export const ChatFileTranscription: FC<ChatFileTranscriptionProps> = props => {
  const { chatBody, setInput } = useChatContext()
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [displayedContents, setDisplayedContents] = useState(props.updatedContents || props.contents)
  const fileTitle = props.name.replace(/[^a-zA-Z0-9]/g, " ").trim()

  useEffect(() => {
    setDisplayedContents(props.updatedContents || props.contents)
  }, [props.updatedContents, props.contents])

  const showTranscriptWithSpeakers = "**Speaker:** " + displayedContents.replace(/\n/g, "\n\n**Speaker:** ")

  const onDownloadTranscription = useCallback(async (): Promise<void> => {
    const fileName = `${fileTitle}-transcription.docx`
    const chatThreadName = chatBody.chatThreadName || `${APP_NAME} ${fileName}`
    await convertTranscriptionToWordDocument([displayedContents], props.name, fileName, APP_NAME, chatThreadName)
  }, [displayedContents, props.name, chatBody.chatThreadName, fileTitle])

  const onDownloadReport = useCallback(async (): Promise<void> => {
    const fileName = `${fileTitle}-report.docx`
    await convertTranscriptionReportToWordDocument([displayedContents], fileName)
  }, [fileTitle, displayedContents])

  const onDownloadVttFile = useCallback((): void => {
    const element = document.createElement("a")
    element.setAttribute("href", `data:text/plain;base64,${toBinaryBase64(props.vtt ?? "")}`)
    element.setAttribute("download", `${fileTitle}-transcription.vtt`)
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }, [fileTitle, props.vtt])

  const { iconSize, buttonClass } = useButtonStyles()

  const handleSave = async (updatedContent: string): Promise<void> => {
    try {
      const response = await fetch(`/api/chat/${props.chatThreadId}/document/${props.documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedContent }),
      })
      if (!response.ok) throw new Error("Failed to save document.")
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
          <div className="flex flex-1 justify-end gap-2">
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
        <ChatTranscriptEditor
          originalContent={props.contents}
          updatedContent={displayedContents}
          onChange={handleSave}
        />
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
