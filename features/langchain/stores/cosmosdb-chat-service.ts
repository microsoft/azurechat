import { Container, CosmosClient, SqlQuerySpec } from "@azure/cosmos";

export interface ChatMessageModel {
  id: string;
  createdAt: Date;
  isDeleted: boolean;
  name: string;
  content: string;
  role: chatRole | string;
  type: string;
}

export type chatRole = "system" | "user" | "assistant" | "function";

export const MESSAGE_ATTRIBUTE = "CHAT_MESSAGE";

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
  sessionId: string,
  container: Container
) => {
  const querySpec: SqlQuerySpec = {
    query:
      "SELECT * FROM root r WHERE r.type=@type AND r.sessionId = @sessionId AND r.isDeleted=@isDeleted",
    parameters: [
      {
        name: "@type",
        value: MESSAGE_ATTRIBUTE,
      },
      {
        name: "@sessionId",
        value: sessionId,
      },
      {
        name: "@isDeleted",
        value: false,
      },
    ],
  };

  const { resources } = await container.items
    .query<ChatMessageModel>(querySpec)
    .fetchAll();

  return resources;
};

export const addChatMessage = async (
  modelToSave: ChatMessageModel,
  container: Container
) => {
  await container.items.upsert(modelToSave);
};
