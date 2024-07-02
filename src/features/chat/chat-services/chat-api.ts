import { OpenAIStream, StreamingTextResponse, JSONValue, StreamData } from "ai"
import { BadRequestError } from "openai"
import { ChatCompletionChunk, ChatCompletionMessageParam, Completion } from "openai/resources"
import { Stream } from "openai/streaming"

import { APP_NAME } from "@/app-global"

import {
  AssistantChatMessageModel,
  ChatMessageModel,
  ChatRecordType,
  ChatRole,
  ChatSentiment,
  ChatThreadModel,
  FeedbackType,
  PromptMessage,
  PromptProps,
} from "@/features/chat/models"
import { mapOpenAIChatMessages } from "@/features/common/mapping-helper"
import { OpenAIInstance } from "@/features/common/services/open-ai"
import logger from "@/features/insights/app-insights"

import {
  buildAudioChatMessages,
  buildDataChatMessages,
  buildSimpleChatMessages,
  getContextPrompts,
} from "./chat-api-helper"
import { calculateFleschKincaidScore } from "./chat-flesch"
import { FindTopChatMessagesForCurrentUser, UpsertChatMessage } from "./chat-message-service"
import { InitThreadSession, UpsertChatThread } from "./chat-thread-service"
import { translator } from "./chat-translator-service"
import { UpdateChatThreadIfUncategorised } from "./chat-utility"

const dataChatTypes = ["data", "mssql", "audio"]
export const MAX_CONTENT_FILTER_TRIGGER_COUNT_ALLOWED = 3

export const ChatApi = async (props: PromptProps): Promise<Response> => {
  try {
    const threadSession = await InitThreadSession(props)
    if (threadSession.status !== "OK") throw threadSession

    const { chatThread } = threadSession.response
    const updatedLastHumanMessage = props.messages[props.messages.length - 1]

    let userMessage: ChatCompletionMessageParam
    let metaPrompt: ChatCompletionMessageParam
    let context: string = ""
    let shouldTranslate = false

    if (props.chatType === "simple" || !dataChatTypes.includes(props.chatType)) {
      const res = await buildSimpleChatMessages(updatedLastHumanMessage)
      userMessage = res.userMessage
      metaPrompt = res.systemMessage
      shouldTranslate = true
    } else if (props.chatType === "audio") {
      const res = await buildAudioChatMessages(updatedLastHumanMessage, chatThread.chatThreadId)
      userMessage = res.userMessage
      metaPrompt = res.systemMessage
      context = res.context
    } else {
      const res = await buildDataChatMessages(updatedLastHumanMessage, chatThread.chatThreadId)
      userMessage = res.userMessage
      metaPrompt = res.systemMessage
      context = res.context
    }

    if ((chatThread.contentFilterTriggerCount || 0) >= MAX_CONTENT_FILTER_TRIGGER_COUNT_ALLOWED) {
      return new Response(JSON.stringify({ error: "This thread is locked" }), { status: 400 })
    }

    const historyResponse = await FindTopChatMessagesForCurrentUser(chatThread.id)
    if (historyResponse.status !== "OK") throw historyResponse

    const data = new StreamData()

    const { response, contentFilterResult, updatedThread } = await getChatResponse(
      chatThread,
      metaPrompt,
      userMessage,
      historyResponse.response,
      updatedLastHumanMessage,
      data
    )

    const contextPrompts = await getContextPrompts()
    const chatMessageResponse = await UpsertChatMessage({
      id: updatedLastHumanMessage.id,
      createdAt: new Date(),
      type: ChatRecordType.Message,
      isDeleted: false,
      content: updatedLastHumanMessage.content,
      role: ChatRole.User,
      chatThreadId: chatThread.id,
      userId: chatThread.userId,
      tenantId: chatThread.tenantId,
      context: context,
      systemPrompt: contextPrompts.metaPrompt,
      tenantPrompt: contextPrompts.tenantPrompt,
      userPrompt: contextPrompts.userPrompt,
      contentFilterResult,
      fleschKincaidScore: calculateFleschKincaidScore(updatedLastHumanMessage.content),
      // name: chatThread.useName,
    })
    if (chatMessageResponse.status !== "OK") throw chatMessageResponse

    const createAssistantChatRecord = (
      content: string,
      isPartial: boolean = false,
      originalCompletion: string = "",
      fleschKincaidScore: number | undefined = undefined
    ): AssistantChatMessageModel => ({
      id: props.data.completionId,
      createdAt: new Date(),
      type: ChatRecordType.Message,
      isDeleted: false,
      content: content,
      originalCompletion: originalCompletion,
      role: ChatRole.Assistant,
      chatThreadId: chatThread.id,
      userId: chatThread.userId,
      tenantId: chatThread.tenantId,
      feedback: FeedbackType.None,
      sentiment: ChatSentiment.Neutral,
      reason: "",
      fleschKincaidScore: fleschKincaidScore,
      // name: APP_NAME || "Assistant",
      isPartial: isPartial,
    })

    const partialMessage: string[] = []
    let timer: NodeJS.Timeout | undefined
    let completed = false

    const handlePartialText = (text: string): void => {
      if (completed) return
      partialMessage.push(text)

      if (timer) {
        clearTimeout(timer)
      }

      timer = setTimeout(async () => {
        if (completed) return //just in case...
        await UpsertChatMessage(createAssistantChatRecord(partialMessage.join(""), true))
      }, 1000)
    }

    const translate = async (input: string, useTranslator: boolean): Promise<string> => {
      if (!useTranslator) return await Promise.resolve("")

      const translatedCompletion = await translator(input)
      return translatedCompletion.status === "OK" ? translatedCompletion.response : ""
    }

    const stream = OpenAIStream(response as AsyncIterable<Completion>, {
      onText: handlePartialText,
      async onCompletion(completion: string) {
        completed = true
        clearTimeout(timer)

        const translatedCompletion = await translate(completion, shouldTranslate)
        const addedMessage = await UpsertChatMessage(
          createAssistantChatRecord(
            translatedCompletion ? translatedCompletion : completion,
            false,
            translatedCompletion ? completion : "",
            calculateFleschKincaidScore(translatedCompletion ? translatedCompletion : completion)
          )
        )
        if (addedMessage?.status !== "OK") throw addedMessage.errors

        data.append({
          id: addedMessage.response.id,
          role: addedMessage.response.role,
          content: addedMessage.response.content,
          // name: addedMessage.response.name,
        })

        addedMessage.response.content &&
          (await UpdateChatThreadIfUncategorised(updatedThread, addedMessage.response.content))
      },
      async onFinal() {
        await data.close()
      },
    })

    return new StreamingTextResponse(stream, { headers: { "Content-Type": "text/event-stream" } }, data)
  } catch (error) {
    const errorResponse = error instanceof Error ? error.message : "An unknown error occurred."
    const errorStatusText = error instanceof Error ? error.toString() : "Unknown Error"

    logger.error("ChatApi error", { error })

    return new Response(errorResponse, {
      status: 500,
      statusText: errorStatusText,
    })
  }
}

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

async function getChatResponse(
  chatThread: ChatThreadModel,
  systemPrompt: ChatCompletionMessageParam,
  userMessage: ChatCompletionMessageParam,
  history: ChatMessageModel[],
  addMessage: PromptMessage,
  data: StreamData
): Promise<{
  response: AsyncGenerator<ChatCompletionChunk> | Stream<ChatCompletionChunk>
  contentFilterResult?: JSONValue
  updatedThread: ChatThreadModel
}> {
  let contentFilterTriggerCount = chatThread.contentFilterTriggerCount ?? 0

  try {
    const openAI = OpenAIInstance({ contentSafetyOn: !["audio"].includes(chatThread.chatType) })
    return {
      response: await openAI.chat.completions.create({
        messages: [systemPrompt, ...mapOpenAIChatMessages(history), userMessage],
        model: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
        stream: true,
      }),
      updatedThread: chatThread,
    }
  } catch (exception) {
    if (!(exception instanceof BadRequestError) || exception.code !== "content_filter") throw exception

    const contentFilterResult = exception.error as JSONValue
    contentFilterTriggerCount++

    data.append({
      id: addMessage.id,
      content: addMessage.content,
      role: addMessage.role,
      name: APP_NAME || "Assistant",
      contentFilterResult,
      contentFilterTriggerCount,
    })

    const upadatedThread = await UpsertChatThread({
      ...chatThread,
      contentFilterTriggerCount,
    })
    if (upadatedThread.status !== "OK") throw upadatedThread.errors

    return {
      response: makeContentFilterResponse(contentFilterTriggerCount >= MAX_CONTENT_FILTER_TRIGGER_COUNT_ALLOWED),
      contentFilterResult,
      updatedThread: upadatedThread.response,
    }
  }
}
