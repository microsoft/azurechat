"use client"

import { Textarea } from "@/features/ui/textarea"

import { useTranscriptEditor } from "./transcript-editor-provider"

export const TranscriptionTextEditor = (): JSX.Element => {
  const { content, onContentChange } = useTranscriptEditor()

  return (
    <Textarea
      className="size-full min-h-full min-w-full rounded-md border-2 p-2"
      value={content}
      onChange={e => onContentChange(e.target.value)}
      onBlur={() => onContentChange(content)}
    />
  )
}
