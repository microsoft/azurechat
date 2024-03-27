import { useEffect, useState } from "react"
import { getPromptSuggestions } from "@/features/chat/chat-services/prompt-suggestions"
import React from "react"

interface PromptSuggestionProps {
  newInputValue: string
  onSelect: (selectedValue: string) => void
  onHide: () => void
}
export const PromptSuggestion: React.FC<PromptSuggestionProps> = ({ newInputValue, onSelect, onHide }) => {
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    const fetchSuggestions = async (): Promise<string[]> => await getPromptSuggestions(newInputValue)

    fetchSuggestions()
      .then(fetchedSuggestions => setSuggestions(fetchedSuggestions))
      .catch(_err => setSuggestions([]))
  }, [newInputValue])

  const handleSuggestionClick = (suggestion: string): void => {
    onSelect(suggestion)
    onHide()
  }

  return (
    <div>
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  )
}
