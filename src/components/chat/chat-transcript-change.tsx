"use client"

import React, { useState } from "react"

import useSyncScroll from "@/components/hooks/use-sync-scroll"
import Typography from "@/components/typography"
import { Button } from "@/features/ui/button"
import { calculateAccuracy } from "@/lib/calculate-accuracy"

import { TranscriptForm, TranscriptionTextEditor } from "./chat-transcript-editor"

type ChatTranscriptEditorProps = {
  originalContent: string
  updatedContent: string
  onChange: (updates: string) => void
}

export const ChatTranscriptEditor: React.FC<ChatTranscriptEditorProps> = ({
  originalContent,
  updatedContent,
  ...rest
}) => {
  const originalSentences = originalContent.split("\n").map(line => line.trim())
  const [accuracy, setAccuracy] = useState(calculateAccuracy(originalContent, updatedContent))
  const [leftPanel, rightPanel] = useSyncScroll<HTMLDivElement>()

  const [content, setContent] = useState(updatedContent)
  const [sentences, setSentences] = useState(updatedContent.split("\n"))
  const [editorType, setEditorType] = useState<"text" | "form">("form")

  const handleReset = (content: string) => () => {
    setSentences(content.split("\n"))
    setContent(content)
    const newAccuracy = calculateAccuracy(originalContent, content)
    setAccuracy(newAccuracy)
  }

  const onContentChange = (value: string): void => {
    setSentences(value.split("\n"))
    setContent(value)
    const newAccuracy = calculateAccuracy(originalContent, value)
    setAccuracy(newAccuracy)
  }

  const onSentencesChange = (value: string[]): void => {
    const update = value.join("\n")
    setSentences(value)
    setContent(update)
    const newAccuracy = calculateAccuracy(originalContent, update)
    setAccuracy(newAccuracy)
  }

  const handleSubmit = (value: string[] | string) => (): void => {
    const newContent = typeof value === "string" ? value : value.join("\n")
    setContent(newContent)
    const newSentences = typeof value === "string" ? value.split("\n") : value
    setSentences(newSentences)
    const newAccuracy = calculateAccuracy(originalContent, newContent)
    setAccuracy(newAccuracy)
    rest.onChange(newContent)
  }

  return (
    <div className="flex flex-col gap-2">
      <section className="grid w-full grid-cols-8 gap-4">
        <div className="col-span-3 flex flex-col">
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
        <div className="col-span-5 flex flex-col">
          <Typography variant="h4" className="flex items-center justify-between">
            <span className="py-2">Updated Transcription</span>
            <div className="flex gap-2 p-2">
              <Button
                variant={"default"}
                onClick={() => setEditorType(prev => (prev === "text" ? "form" : "text"))}
                className="flex items-center gap-2"
                ariaLabel="Toggle editor type"
              >
                {`${editorType === "text" ? "Form" : "Text"} Editor`}
              </Button>
              <Button variant="destructive" onClick={handleReset(originalContent)} ariaLabel="Reset from original">
                Reset
              </Button>
              <Button
                variant="destructive"
                onClick={handleReset(updatedContent)}
                className="text-destructive-foreground hover:bg-error"
                ariaLabel="Reset from latest update"
              >
                Undo
              </Button>
              <Button
                variant="accent"
                onClick={handleSubmit(editorType === "text" ? content : sentences)}
                ariaLabel="Save changes"
              >
                Save
              </Button>
            </div>
          </Typography>
          <Panel ref={rightPanel}>
            {editorType === "text" && <TranscriptionTextEditor initialContent={content} onChange={onContentChange} />}
            {editorType === "form" && <TranscriptForm initialContent={sentences} onChange={onSentencesChange} />}
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
