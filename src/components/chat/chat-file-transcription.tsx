import { DownloadIcon, CaptionsIcon, FileTextIcon } from "lucide-react"
import { FC, useCallback, useState } from "react"

import { APP_NAME } from "@/app-global"

import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import {
  convertTranscriptionToWordDocument,
  convertTranscriptionReportToWordDocument,
} from "@/features/common/file-export"
import { CopyButton } from "@/features/ui/assistant-buttons"
import { CheckTranscriptionButton } from "@/features/ui/assistant-buttons/rewrite-message-button"
import { Button } from "@/features/ui/button"
import { useWindowSize } from "@/features/ui/windowsize"

interface ChatFileTranscriptionProps {
  name: string
  contents: string
  vtt: string
}

export const ChatFileTranscription: FC<ChatFileTranscriptionProps> = props => {
  const { chatBody, setInput } = useChatContext()
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const fileTitle = props.name.replace(/[^a-zA-Z0-9]/g, " ").trim()

  const onDownloadTranscription = useCallback(async (): Promise<void> => {
    const fileName = `${fileTitle}-transcription.docx`
    await convertTranscriptionToWordDocument([props.contents], fileName)
  }, [props.contents, fileTitle])

  const onDownloadReport = useCallback(async (): Promise<void> => {
    const fileName = `${fileTitle}-report.docx`
    const chatThreadName = chatBody.chatThreadName || `${APP_NAME} ${fileName}`
    await convertTranscriptionReportToWordDocument([props.contents], props.name, fileName, APP_NAME, chatThreadName)
  }, [fileTitle, chatBody.chatThreadName, props.contents, props.name])

  const onDownloadVttFile = useCallback((): void => {
    const element = document.createElement("a")
    element.setAttribute("href", `data:text/plain;base64,${toBinaryBase64(props.vtt ?? "")}`)
    element.setAttribute("download", `${fileTitle}-transcription.vtt`)
    document.body.appendChild(element)
    element.click()

    document.body.removeChild(element)
  }, [fileTitle, props.vtt])

  const { width } = useWindowSize()
  const { iconSize, buttonClass } = getIconSize(width)

  return (
    <article className="container mx-auto flex flex-col py-1 pb-4">
      <section className="flex-col gap-4 overflow-hidden rounded-md bg-background p-4">
        <header className="flex w-full items-center justify-between">
          <Typography variant="h3">{fileTitle}</Typography>
          <div className="container flex w-full gap-4 p-2">
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

            {props.vtt.length > 0 && (
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

            <CheckTranscriptionButton transcription={props.contents} onAssistantButtonClick={setInput} />
            <CopyButton message={props.contents} onFeedbackChange={setFeedbackMessage} />
          </div>
        </header>
        <div className="prose prose-slate max-w-none break-words text-base italic text-text dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 md:text-base">
          <Markdown content={props.contents.replaceAll("\n", "\n\n") || ""} />
        </div>
        <div className="sr-only" aria-live="assertive">
          {feedbackMessage}
        </div>
      </section>
    </article>
  )
}

const toBinaryBase64 = (text: string): string => {
  const codeUnits = new Uint16Array(text.length)
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = text.charCodeAt(i)
  }

  return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)))
}

const getIconSize = (width: number): { iconSize: number; buttonClass: string } => {
  if (width < 768) return { iconSize: 10, buttonClass: "h-7" }
  if (width >= 768 && width < 1024) return { iconSize: 12, buttonClass: "h-9" }
  if (width >= 1024) return { iconSize: 16, buttonClass: "h-9" }
  return { iconSize: 10, buttonClass: "h-9" }
}
