import { ChatMessageModel } from "@/features/chat/chat-services/models";
import { ChatCompletionMessage } from "openai/resources";

export function mapOpenAIChatMessages(
  messages: ChatMessageModel[]
): ChatCompletionMessage[] {
  return messages.map((message) => {
    return {
      role: message.role,
      content: message.content,
    };
  });
}
