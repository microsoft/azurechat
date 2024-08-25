"use client"

import { Sparkles, Sparkle } from "lucide-react"
import React, { useState, useCallback } from "react"

import useSmartGen from "@/components/hooks/use-smart-gen"

import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { PromptMessage } from "@/features/chat/models"
import logger from "@/features/insights/app-insights"
import { useSettingsContext } from "@/features/settings/settings-provider"
import { SupportedSmartGenToolId } from "@/features/smart-gen/models"
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
}) => (
  <RewriteMessageButtonInternal
    toolId={getRewriterAction(fleschScore, !!message.contentFilterResult)}
    context={message}
    input={message.content}
    onAssistantButtonClick={onAssistantButtonClick}
  />
)

export type CheckTranscriptionButtonProps = {
  transcription: string
  onAssistantButtonClick: (result: string) => void
}

export const CheckTranscriptionButton: React.FC<CheckTranscriptionButtonProps> = ({
  transcription,
  onAssistantButtonClick,
}) => (
  <RewriteMessageButtonInternal
    toolId={"checkTranscription"}
    context={transcription}
    input={transcription}
    onAssistantButtonClick={onAssistantButtonClick}
  />
)

const RewriteMessageButtonInternal: React.FC<{
  toolId: SupportedSmartGenToolId
  context: unknown
  input: string
  onAssistantButtonClick: (result: string) => void
}> = ({ toolId, context, input, onAssistantButtonClick }) => {
  const { iconSize, buttonClass } = useButtonStyles()
  const { chatThreadLocked } = useChatContext()

  const { config } = useSettingsContext()
  const { smartGen } = useSmartGen(config.tools)

  const [rewriteClicked, setRewriteClicked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRewriteWithSuggestions = useCallback(async (): Promise<void> => {
    setRewriteClicked(true)
    setIsLoading(true)

    try {
      const response = await smartGen({
        toolId: toolId,
        context: { context, uiComponent: "RewriteMessageButton" },
        input: input,
      })
      if (!response) throw new Error("Failed to save smart-gen output")
      onAssistantButtonClick(response)
    } catch (error) {
      logger.error(error instanceof Error ? error.message : JSON.stringify(error))
    } finally {
      setIsLoading(false)
      setTimeout(() => setRewriteClicked(false), 2000)
    }
  }, [toolId, context, input, onAssistantButtonClick, smartGen])

  return (
    <Button
      ariaLabel="Rewrite with suggestions"
      variant={"ghost"}
      size={"default"}
      className={`${buttonClass} ${rewriteClicked ? "bg-button text-buttonText" : ""}`}
      title="Rewrite with suggestions"
      onClick={handleRewriteWithSuggestions}
      disabled={chatThreadLocked}
    >
      {rewriteClicked ? (
        <Sparkles size={iconSize} className={isLoading ? "animate-spin" : ""} />
      ) : (
        <Sparkle size={iconSize} />
      )}
    </Button>
  )
}

const getRewriterAction = (score: number, contentFilter: boolean): SupportedSmartGenToolId => {
  if (contentFilter) return "formatToExplain"
  if (score > 8) return "formatToSimplify"
  if (score <= 8) return "formatToImprove"
  return "formatToImprove"
}
