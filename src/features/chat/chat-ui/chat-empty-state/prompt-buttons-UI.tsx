import React, { useState, useEffect } from "react"
import { PromptButtons } from "@/features/chat/chat-services/prompt-buttons"
import { Button } from "@/features/ui/button"

interface Prop {
  onPromptSelected: (prompt: string) => void
  selectedPrompt?: string
}

export const PromptButton: React.FC<Prop> = ({ onPromptSelected, selectedPrompt }) => {
  const [prompts, setPrompts] = useState<string[]>([])
  useEffect(() => {
    const fetchPrompts = async (): Promise<string[]> => await PromptButtons()

    fetchPrompts()
      .then(data => setPrompts(data))
      .catch(_err => setPrompts([]))
  }, [])

  const handlePromptClick = (prompt: string): void => {
    onPromptSelected(prompt)
  }

  return (
    <div className="space-container">
      <ul aria-live="polite" className="mb-2 w-full ">
        {prompts.map((prompt, index) => (
          <li key={index} className="mb-2 rounded bg-background text-foreground">
            <Button
              onClick={() => handlePromptClick(prompt)}
              className={`w-full rounded p-2 text-center text-buttonText ${selectedPrompt === prompt ? "bg-button" : "text-buttonText"}`}
              disabled={selectedPrompt === prompt}
              aria-pressed={selectedPrompt === prompt}
            >
              {prompt}
            </Button>
          </li>
        ))}
      </ul>
      <div className="additional-spacing" />
    </div>
  )
}
