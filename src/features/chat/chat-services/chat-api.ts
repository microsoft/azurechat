/* eslint-disable indent */
import { JSONValue, Message, OpenAIStream, StreamingTextResponse, experimental_StreamData } from "ai"
import { APIError } from "openai"
import { ChatCompletionChunk, ChatCompletionMessageParam } from "openai/resources"
import { Completion } from "openai/resources/completions"

import {
  UpsertChatMessage,
  FindTopChatMessagesForCurrentUser,
  ChatCompletionMessageTranslated,
} from "./chat-message-service"
import { UpsertChatThread } from "./chat-thread-service"
import { UpdateChatThreadIfUncategorised } from "./chat-utility"

import { ChatRole, CreateCompletionMessage, ChatThreadModel, ChatMessageModel } from "@/features/chat/models"
import { mapOpenAIChatMessages } from "@/features/common/mapping-helper"
import { ServerActionResponse } from "@/features/common/server-action-response"
import { OpenAIInstance } from "@/features/common/services/open-ai"

export const ChatAPI = async (
  systemPrompt: string,
  userMessage: ChatCompletionMessageParam,
  chatThread: ChatThreadModel,
  updatedLastHumanMessage: ChatMessageModel,
  translate: (input: string) => Promise<string>
): Promise<Response> => {
  const openAI = OpenAIInstance()

  const historyResponse = await FindTopChatMessagesForCurrentUser(chatThread.id)
  if (historyResponse.status !== "OK") throw historyResponse

  let contentFilterTriggerCount = chatThread.contentFilterTriggerCount ?? 0

  const addMessageResponse = await UpsertChatMessage(
    chatThread.id,
    {
      content: updatedLastHumanMessage.content,
      role: ChatRole.User,
    },
    updatedLastHumanMessage.id
  )
  if (addMessageResponse.status !== "OK") throw addMessageResponse

  const data = new experimental_StreamData()
  //TODO: Fix Liniting indent problem
  let response
  try {
    response =
      contentFilterTriggerCount >= maxContentFilterTriggerCountAllowed
        ? makeContentFilterResponse(true)
        : await openAI.chat.completions.create({
            messages: [
              {
                role: ChatRole.System,
                content: systemPrompt,
              },
              ...mapOpenAIChatMessages([...historyResponse.response]),
              userMessage,
            ],
            model: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
            stream: true,
          })
  } catch (exception) {
    if (exception instanceof APIError && exception.status === 400 && exception.code === "content_filter") {
      const contentFilterResult = exception.error as unknown
      contentFilterTriggerCount++

      let upsertResponse: ServerActionResponse<unknown> = await UpsertChatMessage(
        chatThread.id,
        {
          ...addMessageResponse.response,
          contentFilterResult,
        },
        updatedLastHumanMessage.id
      )
      if (upsertResponse.status !== "OK") throw upsertResponse

      upsertResponse = await UpsertChatThread({ ...chatThread, contentFilterTriggerCount })
      if (upsertResponse.status !== "OK") throw upsertResponse

      data.append({
        id: addMessageResponse.response.id,
        content: addMessageResponse.response.content,
        contentFilterResult,
        contentFilterTriggerCount,
      } as DataItem)

      response = makeContentFilterResponse(contentFilterTriggerCount >= maxContentFilterTriggerCountAllowed)
    } else {
      throw exception
    }
  }

  const stream = OpenAIStream(response as AsyncIterable<Completion>, {
    async onCompletion(completion: string) {
      const translatedCompletion = await translate(completion)
      const message = buildAssistantChatMessage(completion, translatedCompletion)

      const completionMessage = updatedLastHumanMessage as typeof updatedLastHumanMessage & CreateCompletionMessage
      const addedMessage = await UpsertChatMessage(chatThread.id, message, completionMessage.completionId)
      if (addedMessage?.status !== "OK") {
        throw addedMessage.errors
      }

      data.append({
        id: addedMessage.response.id,
        content: addedMessage.response.content,
      } as DataItem)

      message.content && (await UpdateChatThreadIfUncategorised(chatThread, message.content))
    },
    async onFinal() {
      await data.close()
    },
    experimental_streamData: true,
  })

  return new StreamingTextResponse(
    stream,
    {
      headers: { "Content-Type": "text/event-stream" },
    },
    data
  )
}

export type DataItem = JSONValue &
  Message & {
    contentFilterResult?: unknown
    contentFilterTriggerCount: number
  }

export const maxContentFilterTriggerCountAllowed = 3
async function* makeContentFilterResponse(lockChatThread: boolean): AsyncGenerator<ChatCompletionChunk> {
  yield {
    choices: [
      {
        delta: {
          content: lockChatThread
            ? "I'm sorry, but this chat is now locked after multiple safety concerns. We can't proceed with more messages. Please start a new chat."
            : "I'm sorry I wasn't able to respond to that message, could you try rephrasing, using different language or starting a new chat if this persists.",
        },
        finish_reason: "stop",
        index: 0,
      },
    ],
    created: Math.round(Date.now() / 1000),
    id: `chatcmpl-${Date.now()}`,
    model: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
    object: "chat.completion.chunk",
  }
}

const buildAssistantChatMessage = (completion: string, translate: string): ChatCompletionMessageTranslated => {
  if (translate)
    return {
      originalCompletion: completion,
      content: translate,
      role: "assistant",
    }
  return {
    content: completion,
    role: "assistant",
  }
}
