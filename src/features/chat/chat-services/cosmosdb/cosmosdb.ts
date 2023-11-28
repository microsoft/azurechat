import {
  FindAllChats,
  UpsertChat,
} from "@/features/chat/chat-services/chat-service";
import {
  ChatMessageModel,
  MESSAGE_ATTRIBUTE,
} from "@/features/chat/chat-services/models";
import database from "@/features/common/database";
import { uniqueId } from "@/features/common/util";
import { ChatMessage } from "@prisma/client";
import { ChatCompletionMessage } from "openai/resources";

export interface CosmosDBChatMessageHistoryFields {
  sessionId: string;
  userId: string;
}

export class CosmosDBChatMessageHistory {
  private sessionId: string;
  private userId: string;

  constructor({ sessionId, userId }: CosmosDBChatMessageHistoryFields) {
    this.sessionId = sessionId;
    this.userId = userId;
  }

  async getMessages(): Promise<ChatCompletionMessage[]> {
    const chats = await FindAllChats(this.sessionId);
    return mapOpenAIChatMessages(chats);
  }

  async clear(): Promise<void> {
    await database.chatMessage.deleteMany({
      where: {
        threadId: this.sessionId,
      },
    });
  }

  async addMessage(message: ChatCompletionMessage, citations: string = "") {
    const modelToSave: ChatMessage = {
      id: uniqueId(),
      createdAt: new Date(),
      type: MESSAGE_ATTRIBUTE,
      isDeleted: false,
      content: message.content ?? "",
      role: message.role,
      threadId: this.sessionId,
      userId: this.userId,
      context: citations,
    };

    await UpsertChat(modelToSave);
  }
}

function mapOpenAIChatMessages(
  messages: ChatMessage[]
): ChatCompletionMessage[] {
  return messages.map((message) => {
    return {
      role: message.role,
      content: message.content,
    };
  });
}
