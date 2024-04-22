import { ConversationStyle } from "@/features/chat/models"

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
