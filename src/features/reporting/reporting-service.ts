import { SqlQuerySpec } from "@azure/cosmos"

import { getTenantId } from "@/features/auth/helpers"
import { DEFAULT_DAYS_AGO } from "@/features/chat/constants"
import { ChatMessageModel, ChatRecordType, ChatThreadModel } from "@/features/chat/models"
import { xDaysAgo } from "@/features/common/date-helper"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { HistoryContainer } from "@/features/common/services/cosmos"

export const FindAllChatThreadsForReporting = async (
  pageSize = 10,
  pageNumber = 0
): ServerActionResponseAsync<ChatThreadModel[]> => {
  try {
    const tenantId = await getTenantId()
    const query: SqlQuerySpec = {
      query: `SELECT *
      FROM root r 
      WHERE r.type=@type AND r.tenantId=@tenantId AND r.createdAt >= @sevenDaysAgo 
      AND r.isDeleted=@isDeleted
      ORDER BY r.createdAt DESC 
      OFFSET ${pageNumber * pageSize} LIMIT ${pageSize}`,
      parameters: [
        { name: "@type", value: ChatRecordType.Thread },
        { name: "@isDeleted", value: false },
        { name: "@tenantId", value: tenantId },
        { name: "@sevenDaysAgo", value: xDaysAgo(DEFAULT_DAYS_AGO) },
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
    const tenantId = await getTenantId()
    const query: SqlQuerySpec = {
      query: "SELECT * FROM root r WHERE r.type=@type AND r.tenantId=@tenantId AND r.id=@id",
      parameters: [
        { name: "@type", value: ChatRecordType.Thread },
        { name: "@tenantId", value: tenantId },
        { name: "@id", value: chatThreadId },
      ],
    }
    const container = await HistoryContainer()
    const { resources } = await container.items.query<ChatThreadModel>(query).fetchAll()
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
    const tenantId = await getTenantId()
    const query: SqlQuerySpec = {
      query: "SELECT * FROM root r WHERE r.type=@type AND r.tenantId=@tenantId AND r.chatThreadId = @chatThreadId",
      parameters: [
        { name: "@type", value: ChatRecordType.Thread },
        { name: "@tenantId", value: tenantId },
        { name: "@chatThreadId", value: chatThreadId },
      ],
    }
    const container = await HistoryContainer()
    const { resources } = await container.items.query<ChatMessageModel>(query).fetchAll()
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
