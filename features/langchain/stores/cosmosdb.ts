import { CosmosClient } from "@azure/cosmos";
import {
  AIMessage,
  BaseListChatMessageHistory,
  BaseMessage,
} from "langchain/schema";
import { nanoid } from "nanoid";
import {
  ChatMessageModel,
  MESSAGE_ATTRIBUTE,
  addChatMessage,
  getChatMessages,
  initChatContainer,
} from "./cosmosdb-chat-service";
import { mapStoredMessagesToChatMessages } from "./utils";

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
    const resources = await getChatMessages(
      this.sessionId,
      await this.getContainer()
    );

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
      data: {
        content: message.content,
        name: this.userId,
        role: message instanceof AIMessage ? "ai" : "human",
      },
      sessionId: this.sessionId,
    };

    await addChatMessage(modelToSave, await this.getContainer());
  }

  getContainer = async () => {
    return await initChatContainer(this.client, this.config);
  };
}
