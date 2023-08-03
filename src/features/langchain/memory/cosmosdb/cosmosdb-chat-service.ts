import {
  FindAllChats,
  UpsertChat,
} from "@/features/chat/chat-services/chat-service";
import {
  ChatMessageModel,
  MESSAGE_ATTRIBUTE,
} from "@/features/chat/chat-services/models";
import { CosmosClient } from "@azure/cosmos";
import { StoredMessage } from "langchain/schema";

export interface CosmosDBClientConfig {
  db: string;
  container: string;
  endpoint: string;
  key: string;
  partitionKey: string;
}

export const initChatContainer = async (
  client: CosmosClient,
  config: CosmosDBClientConfig
) => {
  await client.databases.createIfNotExists({ id: config.db });

  const containerRepose = await client
    .database(config.db)
    .containers.createIfNotExists({
      id: config.container,
      partitionKey: config.partitionKey,
    });

  return containerRepose.container;
};

export const getChatMessages = async (
  sessionId: string
): Promise<StoredMessage[]> => {
  const items = await FindAllChats(sessionId);
  const ms: StoredMessage[] = [];
  items.forEach((item) => {
    ms.push({
      type: MESSAGE_ATTRIBUTE,
      data: {
        content: item.content,
        role: item.role === "user" ? "human" : "ai",
        name: item.userId,
      },
    });
  });

  return ms;
};

export const addChatMessage = async (modelToSave: ChatMessageModel) => {
  return await UpsertChat(modelToSave);
};
