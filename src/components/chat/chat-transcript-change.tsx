"use client"

import { PencilRulerIcon, SpeechIcon } from "lucide-react"
import React from "react"

import useSyncScroll from "@/components/hooks/use-sync-scroll"
import Typography from "@/components/typography"
import { Button } from "@/features/ui/button"

import { TranscriptForm, TranscriptionTextEditor } from "./chat-transcript-editor"
import { useTranscriptEditor } from "./chat-transcript-editor/transcript-editor-provider"

export const ChatTranscriptEditor: React.FC = () => {
  const { accuracy, originalContent, editorType, switchEditor, speakers, prefillSpeakers } = useTranscriptEditor()
  const originalSentences = originalContent.split("\n").map(line => line.trim())
  const [leftPanel, rightPanel] = useSyncScroll<HTMLDivElement>()

  return (
    <div className="flex flex-col gap-2">
      <section className="flex w-full flex-wrap gap-4">
        <div className="flex flex-1 flex-col">
          <Typography variant="h4" className="flex justify-between">
            Original Transcription
            <span className="py-2">Accuracy: {accuracy !== null ? `${accuracy.toFixed(2)}%` : "Not calculated"}</span>
          </Typography>
          <Panel ref={leftPanel}>
            {originalSentences.map((line, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="px-1 py-1">{line}</div>
              </div>
            ))}
          </Panel>
        </div>
        <div className="flex flex-1 flex-col">
          <Typography variant="h4" className="flex gap-2">
            <span className="flex-grow py-2">Updated Transcription</span>
            {!speakers.length && (
              <Button
                variant={"secondary"}
                className="my-1 flex items-center gap-2"
                onClick={prefillSpeakers}
                ariaLabel="prefill speakers"
              >
                <SpeechIcon size={16} />
                Prefill&nbsp;speakers
              </Button>
            )}
            <Button
              variant={"secondary"}
              onClick={() => switchEditor(editorType === "text" ? "form" : "text")}
              className="my-1 flex items-center gap-2"
              ariaLabel="Toggle editor type"
            >
              <PencilRulerIcon
                size={16}
                className={`${editorType === "text" ? "" : "rotate-90"} transition-all duration-300 ease-in`}
              />
              {`Switch to ${editorType === "text" ? "Form" : "Text"}`}
            </Button>
          </Typography>
          <Panel ref={rightPanel}>
            {editorType === "text" && <TranscriptionTextEditor />}
            {editorType === "form" && <TranscriptForm />}
          </Panel>
        </div>
      </section>
    </div>
  )
}

const Panel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => (
  <div ref={ref} className="border-1 h-full max-h-[750px] overflow-y-auto break-words text-text shadow-xl" {...props} />
))
Panel.displayName = "Panel"
