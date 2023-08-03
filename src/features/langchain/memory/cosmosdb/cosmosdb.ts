import {
  ChatMessageModel,
  MESSAGE_ATTRIBUTE,
} from "@/features/chat/chat-services/models";
import { CosmosClient } from "@azure/cosmos";
import {
  AIMessage,
  BaseListChatMessageHistory,
  BaseMessage,
} from "langchain/schema";
import { nanoid } from "nanoid";
import { mapStoredMessagesToChatMessages } from "../utils";
import {
  addChatMessage,
  getChatMessages,
  initChatContainer,
} from "./cosmosdb-chat-service";

export interface CosmosDBClientConfig {
  db: string;
  container: string;
  endpoint: string;
  key: string;
  partitionKey: string;
}

export interface CosmosDBChatMessageHistoryFields {
  sessionId: string;
  userId: string;
  config: CosmosDBClientConfig;
}

export class CosmosDBChatMessageHistory extends BaseListChatMessageHistory {
  lc_namespace = ["langchain", "stores", "message", "cosmosdb"];

  private config: CosmosDBClientConfig;

  private sessionId: string;
  private userId: string;

  private client: CosmosClient;

  constructor({ sessionId, userId, config }: CosmosDBChatMessageHistoryFields) {
    super();
    this.sessionId = sessionId;
    this.userId = userId;
    this.config = config;
    const { endpoint, key } = config;
    this.client = new CosmosClient({ endpoint, key });
  }

  async getMessages(): Promise<BaseMessage[]> {
    const resources = await getChatMessages(this.sessionId);
    return mapStoredMessagesToChatMessages(resources);
  }

  async clear(): Promise<void> {
    const container = await this.getContainer();
    await container.delete();
  }

  protected async addMessage(message: BaseMessage) {
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
    return await initChatContainer(this.client, this.config);
  };
}
