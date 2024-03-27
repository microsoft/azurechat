import { ChatCompletionMessage, ChatCompletionRole } from "openai/resources"
import { ChatMessageModel, ChatRole } from "../chat/models"

export function mapOpenAIChatMessages(messages: ChatMessageModel[]): ChatCompletionMessage[] {
  return messages.map(mapOpenAIChatMessage)
}

export function mapOpenAIChatMessage(message: ChatMessageModel): ChatCompletionMessage {
  return {
    role: message.role,
    content: message.content,
  }
}

export function mapChatCompletionRoleToChatRole(role: ChatCompletionRole): ChatRole {
  return role as unknown as ChatRole
}
