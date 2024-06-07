"use server"
import "server-only"
import logger from "@/features/insights/app-insights"

import { GenericChatAPI } from "./generic-chat-api"

export const getPromptSuggestions = async (input: string): Promise<string[]> => {
  try {
    const apiName = "getPromptSuggestions"
    const promptSuggestion = await GenericChatAPI(apiName, {
      messages: [
        {
          role: "system",
          content: `- create a succinct prompt suggestion, to complete the chat inside double quotes "" ${input} "" without repeating the chat.
                - this prompt will complete the user input with the most relevant words.`,
        },
      ],
    })

    if (!promptSuggestion || promptSuggestion.length === 0) {
      return []
    }

    const prompt = promptSuggestion

    if (prompt == null) {
      return []
    }

    const cleanedPrompt = prompt.replace(/^"+|"+$/g, "")

    if (cleanedPrompt.trim() === "") {
      return []
    }

    return [cleanedPrompt]
  } catch (e) {
    logger.error("Error generating prompt suggestions:", { error: e instanceof Error ? e.message : e })
    return [""]
  }
}
