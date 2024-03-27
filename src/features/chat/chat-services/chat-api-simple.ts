import { userSession } from "@/features/auth/helpers"
import { OpenAIInstance } from "@/features/common/services/open-ai"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { InitChatSession } from "./chat-thread-service"
import { AddChatMessage, FindTopChatMessagesForCurrentUser } from "./chat-message-service"
import { PromptGPTProps, ChatRole } from "../models"
import { UpdateChatThreadIfUncategorised } from "./chat-utility"
import { translator } from "./chat-translator-service"

async function buildUserContextPrompt(): Promise<string> {
  const session = await userSession()
  const displayName = session?.name
  const contextPrompt = session?.contextPrompt
  if (!displayName) return ""
  let prompt = `\nNote, you are chatting to ${displayName}`
  if (contextPrompt && contextPrompt.length > 0) {
    prompt += ` and they have provided the below context:\n${contextPrompt}\n`
  }
  return prompt
}

function getSystemPrompt(): string {
  return (
    process.env.SYSTEM_PROMPT ||
    `-You are QChat who is a helpful AI Assistant developed to assist Queensland government employees in their day-to-day tasks.
    - You will provide clear and concise queries, and you will respond with polite and professional answers.
    - You will answer questions truthfully and accurately.
    - You will respond to questions in accordance with rules of Queensland government.`
  )
}

export async function buildFullMetaPrompt(): Promise<string> {
  const userContextPrompt = await buildUserContextPrompt()
  const systemPrompt = getSystemPrompt()
  return systemPrompt + userContextPrompt
}

export const ChatAPISimple = async (props: PromptGPTProps): Promise<Response> => {
  try {
    const chatResponse = await InitChatSession(props)
    if (chatResponse.status !== "OK") throw chatResponse
    const metaPrompt = await buildFullMetaPrompt()

    const { chatThread, updatedLastHumanMessage } = chatResponse.response
    const openAI = OpenAIInstance()

    const addMessageResponse = await AddChatMessage(chatThread.id, {
      content: updatedLastHumanMessage.content,
      role: "user",
    })
    if (addMessageResponse.status !== "OK") throw addMessageResponse

    const historyResponse = await FindTopChatMessagesForCurrentUser(chatThread.id)
    if (historyResponse.status !== "OK") throw historyResponse

    const response = await openAI.chat.completions.create({
      messages: [{ role: ChatRole.System, content: metaPrompt }, ...historyResponse.response],
      model: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
      stream: true,
    })

    // const stream = OpenAIStream(response, {
    //   async onCompletion(completion) {
    //     try {
    //       const translatedCompletion = await translator(completion);
    //       await chatHistory.addMessage({
    //         content: translatedCompletion,
    //         role: "assistant",
    //       });
    //       await chatCatName(chatThread, lastHumanMessage.content);
    //     } catch (e) {
    //       console.log(e)
    //     }
    //   }
    // });

    const stream = OpenAIStream(response, {
      async onCompletion(completion: string) {
        try {
          const translatedCompletion = await translator(completion)
          if (translatedCompletion.status !== "OK") throw translatedCompletion
          await AddChatMessage(chatThread.id, {
            content: translatedCompletion.response,
            role: "assistant",
          })
          await UpdateChatThreadIfUncategorised(chatThread, translatedCompletion.response)
        } catch (_translationError) {
          await AddChatMessage(chatThread.id, {
            content: completion,
            role: "assistant",
          })
        }
      },
    })

    return new StreamingTextResponse(stream, {
      headers: { "Content-Type": "text/event-stream" },
    })
  } catch (e: unknown) {
    const errorResponse = e instanceof Error ? e.message : "An unknown error occurred."
    const errorStatusText = e instanceof Error ? e.toString() : "Unknown Error"

    return new Response(errorResponse, {
      status: 500,
      statusText: errorStatusText,
    })
  }
}
