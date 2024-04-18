import * as yup from "yup"

import { ChatApi } from "@/features/chat/chat-services/chat-api"
import { ChatRole, ChatType, ConversationSensitivity, ConversationStyle, PromptProps } from "@/features/chat/models"

const delay = async (ms: number): Promise<void> => await new Promise(resolve => setTimeout(resolve, ms))

const errorMessages: Record<number, string> = {
  400: "Oops! Something went wrong with your request.",
  401: "Access denied. Please ensure your credentials are correct.",
  402: "Whoops, looks like you've exceeded your limit! Please try again later.",
  403: "Sorry, we're unable to fulfill your request.",
  429: "Hold on! Too many requests at the moment, please try again after a while.",
}
const defaultErrorMessage = "Our apologies, we're facing some internal issues currently."

const MAX_RETRIES = 2
const RETRY_DELAY = 5000
const schema = yup
  .object<PromptProps>({
    id: yup.string().required(),
    chatType: yup.mixed<ChatType>().oneOf(Object.values(ChatType)).required(),
    conversationStyle: yup.mixed<ConversationStyle>().oneOf(Object.values(ConversationStyle)).required(),
    conversationSensitivity: yup
      .mixed<ConversationSensitivity>()
      .oneOf(Object.values(ConversationSensitivity))
      .required(),
    chatOverFileName: yup.string().defined().strict(true),
    tenantId: yup.string().required(),
    userId: yup.string().required(),
    offenderId: yup.string(),
    chatThreadName: yup.string(),
    messages: yup.array().of(
      yup.object({
        id: yup.string().required(),
        content: yup.string().required(),
        role: yup.mixed<ChatRole>().oneOf(Object.values(ChatRole)).required(),
      })
    ),
    data: yup.object().shape({
      completionId: yup.string().required(),
    }),
  })
  .noUnknown(true, "Attempted to update invalid fields")

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json()
    const validatedRequest = (await schema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    })) as PromptProps

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await ChatApi(validatedRequest)
        return response
      } catch (error: unknown) {
        const errorStatus = (error as { status?: number }).status || 500

        if (errorStatus !== 504 || attempt === MAX_RETRIES) {
          return new Response(errorMessages[errorStatus] || defaultErrorMessage, { status: errorStatus })
        }

        await delay(RETRY_DELAY)
      }
    }
    return new Response("We're sorry, the server timed-out after several retries.", { status: 504 })
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return new Response(`Invalid request body: ${error.errors.join(", ")}`, { status: 400 })
    }
    return new Response("An unknown error occurred", { status: 500 })
  }
}
