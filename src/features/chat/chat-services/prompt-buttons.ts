"use server"
import "server-only"
import logger from "@/features/insights/app-insights"

import { GenericChatAPI } from "./generic-chat-api"

export const PromptButtons = async (): Promise<string[]> => {
  const apiName = "generatePromptButtons"
  const defaultPrompts = ["Summarise the below article into three key points:", "Provide a summary of the below text:"]

  try {
    const promptButtons = await GenericChatAPI(apiName, {
      messages: [
        {
          role: "system",
          content: ` - create two different prompt suggestions which encourage the user to get the most out of an LLM powered Generative AI Assistant, limited to ten words, the user will select this prompt and then add their additional or relevant context; for Queensland government employees:
        - these prompts will have some suggestions similar to the below examples:
          " Summarise the below article into three key points: "
          " Write a response to this email: "
          " Rewrite this in layman terms: "
          " Provide a summary of the below text: "
        - provide response as an array only, must be in format: ["Prompt1", "Prompt2"]`,
        },
      ],
    })
    const prompts = JSON.parse(promptButtons as unknown as string) as string[]

    if (!Array.isArray(prompts) || prompts.some(prompt => typeof prompt !== "string")) {
      logger.error("Error: Unexpected prompt button structure from API.", { prompts })
      return defaultPrompts
    }

    const filteredPrompts = prompts.filter(prompt => typeof prompt === "string")
    return filteredPrompts.length > 0 ? filteredPrompts : defaultPrompts
  } catch (error) {
    logger.error("Error generating prompt buttons:", { error: error instanceof Error ? error.message : error })
    return defaultPrompts
  }
}
