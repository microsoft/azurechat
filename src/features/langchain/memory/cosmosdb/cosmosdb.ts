import {
  ChatMessageModel,
  MESSAGE_ATTRIBUTE,
} from "@/features/chat/chat-services/models";
import { initDBContainer } from "@/features/common/cosmos";
import {
  AIMessage,
  BaseListChatMessageHistory,
  BaseMessage,
} from "langchain/schema";
import { nanoid } from "nanoid";
import { mapStoredMessagesToChatMessages } from "../utils";
import { addChatMessage, getChatMessages } from "./cosmosdb-chat-service";

export interface CosmosDBChatMessageHistoryFields {
  sessionId: string;
  userId: string;
}

export class CosmosDBChatMessageHistory extends BaseListChatMessageHistory {
  lc_namespace = ["langchain", "stores", "message", "cosmosdb"];

  private sessionId: string;
  private userId: string;

  constructor({ sessionId, userId }: CosmosDBChatMessageHistoryFields) {
    super();
    this.sessionId = sessionId;
    this.userId = userId;
  }

  async getMessages(): Promise<BaseMessage[]> {
    const resources = await getChatMessages(this.sessionId);
    return mapStoredMessagesToChatMessages(resources);
  }

  async clear(): Promise<void> {
    const container = await this.getContainer();
    await container.delete();
  }

  async addMessage(message: BaseMessage) {
    const modelToSave: ChatMessageModel = {
      id: nanoid(),
      createdAt: new Date(),
      type: MESSAGE_ATTRIBUTE,
      isDeleted: false,
      content: message.content,
      role: message instanceof AIMessage ? "assistant" : "user",
      threadId: this.sessionId,
      userId: this.userId,
    };

    await addChatMessage(modelToSave);
  }

  getContainer = async () => {
    return await initDBContainer();
  };
}
