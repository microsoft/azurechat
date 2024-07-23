"use client"

import { useEffect, useState } from "react"

import { Textarea } from "@/features/ui/textarea"

type TranscriptionTextEditorProps = {
  initialContent: string
  onChange: (value: string) => void
}
export const TranscriptionTextEditor = ({ initialContent, onChange }: TranscriptionTextEditorProps): JSX.Element => {
  const [content, setContent] = useState("")
  useEffect(() => setContent(initialContent), [initialContent])

  return (
    <Textarea
      className="size-full min-h-full rounded-md border-2 p-2"
      value={content}
      onChange={e => setContent(e.target.value)}
      onBlur={() => onChange(content)}
    />
  )
}
