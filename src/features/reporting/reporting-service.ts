import { SqlQuerySpec } from "@azure/cosmos";
import {
  CHAT_THREAD_ATTRIBUTE,
  ChatMessageModel,
  ChatThreadModel,
  MESSAGE_ATTRIBUTE,
} from "../chat/chat-services/models";
import { CosmosDBContainer } from "../common/cosmos";

export const FindAllChatThreadsForReporting = async (
  pageSize = 10,
  pageNumber = 0
) => {
  const container = await CosmosDBContainer.getInstance().getContainer();

  const querySpec: SqlQuerySpec = {
    query: `SELECT * FROM root r WHERE r.type=@type ORDER BY r.createdAt DESC OFFSET ${
      pageNumber * pageSize
    } LIMIT ${pageSize}`,
    parameters: [
      {
        name: "@type",
        value: CHAT_THREAD_ATTRIBUTE,
      },
    ],
  };

  const { resources } = await container.items
    .query<ChatThreadModel>(querySpec, {
      maxItemCount: pageSize,
    })
    .fetchNext();
  return { resources };
};

export const FindChatThreadByID = async (chatThreadID: string) => {
  const container = await CosmosDBContainer.getInstance().getContainer();

  const querySpec: SqlQuerySpec = {
    query: "SELECT * FROM root r WHERE r.type=@type AND r.id=@id",
    parameters: [
      {
        name: "@type",
        value: CHAT_THREAD_ATTRIBUTE,
      },

      {
        name: "@id",
        value: chatThreadID,
      },
    ],
  };

  const { resources } = await container.items
    .query<ChatThreadModel>(querySpec)
    .fetchAll();

  return resources;
};

export const FindAllChatsInThread = async (chatThreadID: string) => {
  const container = await CosmosDBContainer.getInstance().getContainer();

  const querySpec: SqlQuerySpec = {
    query: "SELECT * FROM root r WHERE r.type=@type AND r.threadId = @threadId",
    parameters: [
      {
        name: "@type",
        value: MESSAGE_ATTRIBUTE,
      },
      {
        name: "@threadId",
        value: chatThreadID,
      },
    ],
  };
  const { resources } = await container.items
    .query<ChatMessageModel>(querySpec)
    .fetchAll();
  return resources;
};
