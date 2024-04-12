import { ChatCompletionMessageParam } from "openai/resources"

import { ChatRole, PromptGPTProps } from "@/features/chat/models"

import { ChatAPI } from "./chat-api"
import {
  buildDataChatContextPrompt,
  buildDataChatSystemPrompt,
  buildSimpleChatSystemPrompt,
  findRelevantDocuments,
} from "./chat-api-helper"
import { InitChatSession } from "./chat-thread-service"
import { translator } from "./chat-translator-service"

const dataChatTypes = ["data", "mssql", "audio"]

export const ChatAPIEntry = async (props: PromptGPTProps): Promise<Response> => {
  try {
    const chatResponse = await InitChatSession(props)
    if (chatResponse.status !== "OK") throw chatResponse

    const { chatThread, updatedLastHumanMessage } = chatResponse.response

    if (props.chatType === "simple" || !dataChatTypes.includes(props.chatType)) {
      const userMessage: ChatCompletionMessageParam = {
        role: ChatRole.User,
        content: updatedLastHumanMessage.content,
      }

      const systemPrompt = await buildSimpleChatSystemPrompt()
      return await ChatAPI(systemPrompt, userMessage, chatThread, updatedLastHumanMessage, translate)
    } else {
      const relevantDocuments = await findRelevantDocuments(updatedLastHumanMessage.content, chatThread.id)
      const context = relevantDocuments
        .map((result, index) => {
          const content = result.pageContent.replace(/(\r\n|\n|\r)/gm, "")
          const context = `[${index}]. file name: ${result.metadata} \n file id: ${result.id} \n order: ${result.order} \n ${content}`
          return context
        })
        .join("\n------\n")

      const userMessage: ChatCompletionMessageParam = {
        role: ChatRole.User,
        content: buildDataChatContextPrompt({
          context,
          userQuestion: updatedLastHumanMessage.content,
        }),
      }

      const systemPrompt = buildDataChatSystemPrompt()
      return await ChatAPI(systemPrompt, userMessage, chatThread, updatedLastHumanMessage, translateDisabled)
    }
  } catch (error) {
    const errorResponse = error instanceof Error ? error.message : "An unknown error occurred."
    const errorStatusText = error instanceof Error ? error.toString() : "Unknown Error"

    return new Response(errorResponse, {
      status: 500,
      statusText: errorStatusText,
    })
  }
}

const translate = async (input: string): Promise<string> => {
  const translatedCompletion = await translator(input)
  return translatedCompletion.status === "OK" ? translatedCompletion.response : ""
}

// TODO: https://dis-qgcdg.atlassian.net/browse/QGGPT-437
const translateDisabled = async (input: string): Promise<string> => await Promise.resolve(input)
