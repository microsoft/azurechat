"use client"

import { Sparkles, Sparkle } from "lucide-react"
import { useState } from "react"

import { PromptMessage } from "@/features/chat/models"
import { useAppInsightsContext } from "@/features/insights/app-insights-context"
import { Button } from "@/features/ui/button"

import { useButtonStyles } from "./use-button-styles"

export type RewriteMessageButtonProps = {
  fleschScore: number
  message: PromptMessage
  onAssistantButtonClick: (result: string) => void
}
export const RewriteMessageButton: React.FC<RewriteMessageButtonProps> = ({
  fleschScore,
  message,
  onAssistantButtonClick,
}) => {
  const { iconSize, buttonClass } = useButtonStyles()
  const { logError } = useAppInsightsContext()

  const [rewriteClicked, setRewriteClicked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRewriteWithSuggestions = async (): Promise<void> => {
    setRewriteClicked(true)
    setIsLoading(true)
    const action = getRewriterAction(fleschScore, !!message.contentFilterResult)
    const rewrittenMessage = rewriteTexts(action, message.content)
    try {
      const response = await fetch("/api/user/smart-gen", {
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({
          id: message.id,
          action,
          context: {
            message,
            uiComponent: "RewriteMessageButton",
          },
          output: rewrittenMessage,
        }),
      })

      if (!response.ok) throw new Error("Failed to save smart-gen output")
    } catch (error) {
      logError(error instanceof Error ? error : new Error(JSON.stringify(error)))
    } finally {
      setIsLoading(false)
      onAssistantButtonClick(rewrittenMessage)
      setTimeout(() => setRewriteClicked(false), 2000)
    }
  }

  return (
    <Button
      ariaLabel="Rewrite with suggestions"
      variant={"ghost"}
      size={"default"}
      className={`${buttonClass} ${rewriteClicked ? "bg-button text-buttonText" : ""}`}
      title="Rewrite with suggestions"
      onClick={handleRewriteWithSuggestions}
    >
      {rewriteClicked ? (
        <Sparkles size={iconSize} className={isLoading ? "animate-spin" : ""} />
      ) : (
        <Sparkle size={iconSize} />
      )}
    </Button>
  )
}

const getRewriterAction = (score: number, contentFilter: boolean): "Simplify" | "Improve" | "Explain" => {
  if (contentFilter) return "Explain"
  if (score > 8) return "Simplify"
  if (score <= 8) return "Improve"
  return "Improve"
}
const rewriteTexts = (action: "Simplify" | "Improve" | "Explain", message: string): string => {
  switch (action) {
    case "Simplify":
      return `Simplify the text below, consider length, readability and tone of voice:

===Text to simplify===

  ${message}

===End of text to simplify===`
    case "Improve":
      return `Improve the text below, consider inclusive language, length, readability and tone of voice:

===Text to improve===

  ${message}

===End of text to improve===`
    case "Explain":
      return `Explain why the text below is not in line with our safety or ethical checks:

===Text to reword===

  ${message}

===End of text to reword===`
    default:
      return "Unknown action"
  }
}
