import { Message } from "ai";
import { ChatMessageModel, ConversationStyle } from "./models";

export const transformCosmosToAIModel = (
  chats: Array<ChatMessageModel>
): Array<Message> => {
  return chats.map((chat) => {
    return {
      role: chat.role,
      content: chat.content,
      id: chat.id,
      createdAt: chat.createdAt,
    };
  });
};

export const transformConversationStyleToTemperature = (
  conversationStyle: ConversationStyle
) => {
  switch (conversationStyle) {
    case "precise":
      return 0.1;
    case "balanced":
      return 0.5;
    case "creative":
      return 1;
    default:
      return 0.5;
  }
};

export const isNotNullOrEmpty = (value?: string) => {
  return value !== null && value !== undefined && value !== "";
};
