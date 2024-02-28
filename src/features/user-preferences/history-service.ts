import { SqlQuerySpec } from "@azure/cosmos";
import { CHAT_THREAD_ATTRIBUTE, ChatMessageModel, ChatThreadModel, MESSAGE_ATTRIBUTE } from "../chat/chat-services/models";
import { getTenantId, userHashedId } from "@/features/auth/helpers";
import { CosmosDBContainer } from "../common/cosmos";

function threeMonthsAgo(): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 3);
  return date.toISOString();
}

export const FindAllChatThreadsForReporting = async (
  pageSize = 10,
  pageNumber = 0
) => {
  const container = await CosmosDBContainer.getInstance().getContainer();

  const querySpec: SqlQuerySpec = {
    query: `SELECT * FROM root r WHERE .type=@type AND r.userId=@userId AND r.name=@name AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.createdAt >= @createdAt ORDER BY r.createdAt DESC OFFSET ${
      pageNumber * pageSize
    } LIMIT ${pageSize}`,
    parameters: [
      {
        name: "@type",
        value: CHAT_THREAD_ATTRIBUTE,
      },
      {
        name: "@isDeleted",
        value: false,
      },
      {
        name: "@userId",
        value: await userHashedId(),
      },
      {
        name: "@tenantId",
        value: await getTenantId(),
      },
      {
        name: "@createdAt",
        value: threeMonthsAgo(),
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
    query: "SELECT * FROM root r WHERE r.userId=@userId AND r.tenantId=@tenantId AND r.type=@type AND r.id=@id",
    parameters: [
      {
        name: "@type",
        value: CHAT_THREAD_ATTRIBUTE,
      },
      {
        name: "@id",
        value: chatThreadID,
      },
      {
        name: "@userId",
        value: await userHashedId(),
      },
      {
        name: "@tenantId",
        value: await getTenantId(),
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
    query: "SELECT * FROM root r WHERE r.userId=@userId AND r.tenantId=@tenantId AND r.type=@type AND r.threadId = @threadId",
    parameters: [
      {
        name: "@type",
        value: MESSAGE_ATTRIBUTE,
      },
      {
        name: "@threadId",
        value: chatThreadID,
      },
      {
        name: "@userId",
        value: await userHashedId(),
      },
      {
        name: "@tenantId",
        value: await getTenantId(),
      },
    ],
  };
  const { resources } = await container.items
    .query<ChatMessageModel>(querySpec)
    .fetchAll();
  return resources;
};
