import { OpenAIStream, StreamingTextResponse, JSONValue, StreamData } from "ai"
import { BadRequestError } from "openai"
import { ChatCompletionChunk, ChatCompletionMessageParam, Completion } from "openai/resources"
import { Stream } from "openai/streaming"

import {
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

import { buildDataChatMessages, buildSimpleChatMessages, getContextPrompts } from "./chat-api-helper"
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
    let translate: (input: string) => Promise<string>

    if (props.chatType === "simple" || !dataChatTypes.includes(props.chatType)) {
      const res = await buildSimpleChatMessages(updatedLastHumanMessage)
      userMessage = res.userMessage
      metaPrompt = res.systemMessage

      translate = async (input: string): Promise<string> => {
        const translatedCompletion = await translator(input)
        return translatedCompletion.status === "OK" ? translatedCompletion.response : ""
      }
    } else {
      const res = await buildDataChatMessages(updatedLastHumanMessage, chatThread.chatThreadId)
      userMessage = res.userMessage
      metaPrompt = res.systemMessage

      // TODO: https://dis-qgcdg.atlassian.net/browse/QGGPT-437
      translate = async (_input: string): Promise<string> => await Promise.resolve("")
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
      context: "",
      systemPrompt: contextPrompts.metaPrompt,
      tenantPrompt: contextPrompts.tenantPrompt,
      userPrompt: contextPrompts.userPrompt,
      contentFilterResult,
    })
    if (chatMessageResponse.status !== "OK") throw chatMessageResponse

    const stream = OpenAIStream(response as AsyncIterable<Completion>, {
      async onCompletion(completion: string) {
        const translatedCompletion = await translate(completion)
        const addedMessage = await UpsertChatMessage({
          id: props.data.completionId,
          createdAt: new Date(),
          type: ChatRecordType.Message,
          isDeleted: false,
          originalCompletion: translatedCompletion ? completion : "",
          content: translatedCompletion ? translatedCompletion : completion,
          role: ChatRole.Assistant,
          chatThreadId: chatThread.id,
          userId: chatThread.userId,
          tenantId: chatThread.tenantId,
          feedback: FeedbackType.None,
          sentiment: ChatSentiment.Neutral,
          reason: "",
        })
        if (addedMessage?.status !== "OK") throw addedMessage.errors

        data.append({
          id: addedMessage.response.id,
          content: addedMessage.response.content,
        })

        addedMessage.response.content &&
          (await UpdateChatThreadIfUncategorised(updatedThread, addedMessage.response.content))
      },
      async onFinal() {
        await data.close()
      },
      experimental_streamData: true,
    })

    return new StreamingTextResponse(stream, { headers: { "Content-Type": "text/event-stream" } }, data)
  } catch (error) {
    const errorResponse = error instanceof Error ? error.message : "An unknown error occurred."
    const errorStatusText = error instanceof Error ? error.toString() : "Unknown Error"

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
    const openAI = OpenAIInstance()
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
