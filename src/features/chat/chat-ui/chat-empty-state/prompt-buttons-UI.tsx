import React, { useState, useEffect } from "react"

import { PromptButtons } from "@/features/chat/chat-services/prompt-buttons"
import { Button } from "@/features/ui/button"

interface Prop {
  onPromptSelected: (prompt: string, prompts: string[]) => void
  selectedPrompt?: string
}

export const PromptButton: React.FC<Prop> = ({ onPromptSelected, selectedPrompt }) => {
  const [prompts, setPrompts] = useState<string[]>([])
  useEffect(() => {
    const fetchPrompts = async (): Promise<string[]> => await PromptButtons()

    fetchPrompts()
      .then(data => {
        setPrompts(data)
        //Todo store all generated prompts in the chat thread
      })
      .catch(_err => setPrompts([]))
  }, [])

  const handlePromptClick = (prompt: string, prompts: string[]): void => {
    onPromptSelected(prompt, prompts)
  }

  return (
    <div className="space-container">
      <ul aria-live="polite" className="mb-2 w-full">
        {prompts.map((prompt, index) => (
          <li key={index} className="mb-2 rounded bg-background text-foreground">
            <Button
              onClick={() => handlePromptClick(prompt, prompts)}
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
