import { ChatMessageModel, ChatRecordType, ChatThreadModel } from "@/features/chat/models"
import { getTenantId, userHashedId } from "@/features/auth/helpers"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { DEFAULT_MONTHS_AGO } from "@/features/chat/constants"
import { xMonthsAgo } from "@/features/common/date-helper"
import { HistoryContainer } from "@/features/common/services/cosmos"
import { SqlQuerySpec } from "@azure/cosmos"

export const FindAllChatThreadsForReporting = async (
  pageSize = 10,
  pageNumber = 0
): ServerActionResponseAsync<ChatThreadModel[]> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const query: SqlQuerySpec = {
      query: `SELECT * FROM root r WHERE .type=@type AND r.userId=@userId AND r.name=@name AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.createdAt >= @createdAt ORDER BY r.createdAt DESC OFFSET ${pageNumber * pageSize} LIMIT ${pageSize}`,
      parameters: [
        { name: "@type", value: ChatRecordType.Thread },
        { name: "@isDeleted", value: false },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
        { name: "@createdAt", value: xMonthsAgo(DEFAULT_MONTHS_AGO) },
      ],
    }
    const container = await HistoryContainer()
    const { resources } = await container.items.query<ChatThreadModel>(query, { maxItemCount: pageSize }).fetchNext()
    return {
      status: "OK",
      response: resources,
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const FindChatThreadById = async (chatThreadId: string): ServerActionResponseAsync<ChatThreadModel> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const querySpec: SqlQuerySpec = {
      query: "SELECT * FROM root r WHERE r.userId=@userId AND r.tenantId=@tenantId AND r.type=@type AND r.id=@id",
      parameters: [
        { name: "@type", value: ChatRecordType.Thread },
        { name: "@id", value: chatThreadId },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
      ],
    }
    const container = await HistoryContainer()
    const { resources } = await container.items.query<ChatThreadModel>(querySpec).fetchAll()
    return {
      status: "OK",
      response: resources[0],
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const FindAllChatsInThread = async (chatThreadId: string): ServerActionResponseAsync<ChatMessageModel[]> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const querySpec: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.userId=@userId AND r.tenantId=@tenantId AND r.type=@type AND r.chatThreadId = @chatThreadId",
      parameters: [
        { name: "@type", value: ChatRecordType.Message },
        { name: "@chatThreadId", value: chatThreadId },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
      ],
    }
    const container = await HistoryContainer()
    const { resources } = await container.items.query<ChatMessageModel>(querySpec).fetchAll()
    return {
      status: "OK",
      response: resources,
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}
