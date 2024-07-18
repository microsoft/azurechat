import { SqlQuerySpec } from "@azure/cosmos"

import { getTenantId, userHashedId } from "@/features/auth/helpers"
import { DEFAULT_MONTHS_AGO, DEFAULT_DAYS_AGO } from "@/features/chat/constants"
import { ChatMessageModel, ChatRecordType, ChatThreadModel } from "@/features/chat/models"
import { xDaysAgo, xMonthsAgo } from "@/features/common/date-helper"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { HistoryContainer } from "@/features/common/services/cosmos-service"

export const FindAllChatThreadsForUserReporting = async (
  pageSize = 10,
  pageNumber = 0
): ServerActionResponseAsync<{ threads: ChatThreadModel[]; totalCount: number }> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])

    const threadsQuery: SqlQuerySpec = {
      query: `SELECT *
      FROM root r
      WHERE r.type=@type AND r.tenantId=@tenantId AND r.createdAt >= @since
      AND r.isDeleted=@isDeleted AND r.userId=@userId
      ORDER BY r.createdAt DESC
      OFFSET ${pageNumber * pageSize} LIMIT ${pageSize}`,
      parameters: [
        { name: "@type", value: ChatRecordType.Thread },
        { name: "@isDeleted", value: false },
        { name: "@tenantId", value: tenantId },
        { name: "@since", value: xMonthsAgo(DEFAULT_MONTHS_AGO) },
        { name: "@userId", value: userId },
      ],
    }

    const countQuery: SqlQuerySpec = {
      query: `SELECT VALUE COUNT(1)
      FROM root r
      WHERE r.type=@type AND r.tenantId=@tenantId AND r.createdAt >= @since
      AND r.isDeleted=@isDeleted AND r.userId=@userId`,
      parameters: [
        { name: "@type", value: ChatRecordType.Thread },
        { name: "@isDeleted", value: false },
        { name: "@tenantId", value: tenantId },
        { name: "@since", value: xMonthsAgo(DEFAULT_MONTHS_AGO) },
        { name: "@userId", value: userId },
      ],
    }

    const container = await HistoryContainer()

    const { resources: threads } = await container.items
      .query<ChatThreadModel>(threadsQuery, { maxItemCount: pageSize })
      .fetchNext()

    const { resources: totalCountArray } = await container.items.query<number>(countQuery).fetchNext()
    const totalCount = totalCountArray[0] ?? 0

    return {
      status: "OK",
      response: { threads, totalCount },
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const FindAllChatThreadsForReporting = async (
  pageSize = 10,
  pageNumber = 0
): ServerActionResponseAsync<ChatThreadModel[]> => {
  try {
    const tenantId = await getTenantId()
    const query: SqlQuerySpec = {
      query: `SELECT *
      FROM root r
      WHERE r.type=@type AND r.tenantId=@tenantId AND r.createdAt >= @since
      AND r.isDeleted=@isDeleted
      ORDER BY r.createdAt DESC
      OFFSET ${pageNumber * pageSize} LIMIT ${pageSize}`,
      parameters: [
        { name: "@type", value: ChatRecordType.Thread },
        { name: "@isDeleted", value: false },
        { name: "@tenantId", value: tenantId },
        { name: "@since", value: xDaysAgo(DEFAULT_DAYS_AGO) },
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
