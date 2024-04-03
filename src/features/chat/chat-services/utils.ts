import { Message } from "ai"

import { ChatMessageModel, ConversationStyle } from "@/features/chat/models"

export const transformCosmosToAIModel = (chats: Array<ChatMessageModel>): Array<Message> => {
  return chats.map(chat => {
    return {
      role: chat.role,
      content: chat.content,
      id: chat.id,
      createdAt: chat.createdAt,
      feedback: chat.feedback,
      sentiment: chat.sentiment,
      reason: chat.reason,
    }
  })
}

export const transformConversationStyleToTemperature = (conversationStyle: ConversationStyle): number => {
  switch (conversationStyle) {
    case "precise":
      return 0
    case "balanced":
      return 0.5
    case "creative":
      return 2
    default:
      return 1
  }
}

export const isNotNullOrEmpty = (value?: string): boolean => {
  return value !== null && value !== undefined && value !== ""
}
