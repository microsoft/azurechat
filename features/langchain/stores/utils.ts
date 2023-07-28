import {
  AIMessage,
  BaseMessage,
  ChatMessage,
  ChatMessageFieldsWithRole,
  HumanMessage,
  StoredMessage,
  SystemMessage,
} from "langchain/schema";

export function mapStoredMessagesToChatMessages(
  messages: StoredMessage[]
): BaseMessage[] {
  return messages.map((message) => {
    switch (message.data.role) {
      case "human":
        return new HumanMessage(message.data);
      case "ai":
        return new AIMessage(message.data);
      case "system":
        return new SystemMessage(message.data);
      case "chat": {
        if (message.data.role === undefined) {
          // throw new Error("Role must be defined for chat messages");
        }
        return new ChatMessage(message.data as ChatMessageFieldsWithRole);
      }
      default:
        throw new Error(`Got unexpected type: ${message.type}`);
    }
  });
}

export function mapChatMessagesToStoredMessages(
  messages: BaseMessage[]
): StoredMessage[] {
  return messages.map((message) => message.toDict());
}
