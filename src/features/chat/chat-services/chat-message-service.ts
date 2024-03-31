"use server"

import { ChatMessageModel, ChatRecordType, ChatSentiment, FeedbackType } from "@/features/chat/models"
import { uniqueId } from "@/lib/utils"
import { ChatCompletionMessage } from "openai/resources"
import { getTenantId, userHashedId } from "@/features/auth/helpers"
import { SqlQuerySpec } from "@azure/cosmos"
import { HistoryContainer } from "@/features/common/services/cosmos"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { mapChatCompletionRoleToChatRole, mapOpenAIChatMessages } from "@/features/common/mapping-helper"

export const FindAllChatMessagesForCurrentUser = async (
  chatThreadId: string
): ServerActionResponseAsync<ChatMessageModel[]> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.type=@type AND r.chatThreadId=@chatThreadId AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.userId=@userId",
      parameters: [
        { name: "@type", value: ChatRecordType.Message },
        { name: "@chatThreadId", value: chatThreadId },
        { name: "@isDeleted", value: false },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
      ],
    }
    const container = await HistoryContainer()
    const result = await container.items.query<ChatMessageModel>(query).fetchAll()
    return {
      status: "OK",
      response: result.resources,
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const FindTopChatMessagesForCurrentUser = async (
  chatThreadId: string,
  top = 30
): ServerActionResponseAsync<ChatCompletionMessage[]> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const query: SqlQuerySpec = {
      query:
        "SELECT TOP @top * FROM root r WHERE r.type=@type AND r.chatThreadId=@chatThreadId AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.userId=@userId",
      parameters: [
        { name: "@type", value: ChatRecordType.Message },
        { name: "@chatThreadId", value: chatThreadId },
        { name: "@isDeleted", value: false },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
        { name: "@top", value: top },
      ],
    }
    const container = await HistoryContainer()
    const result = await container.items.query<ChatMessageModel>(query).fetchAll()
    return {
      status: "OK",
      response: mapOpenAIChatMessages(result.resources),
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const FindChatMessageForCurrentUser = async (
  chatThreadId: string,
  messageId: string
): ServerActionResponseAsync<ChatMessageModel> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.type=@type AND r.chatThreadId=@chatThreadId AND r.id=@id AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.userId=@userId",
      parameters: [
        { name: "@type", value: ChatRecordType.Message },
        { name: "@chatThreadId", value: chatThreadId },
        { name: "@id", value: messageId },
        { name: "@isDeleted", value: false },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
      ],
    }
    const container = await HistoryContainer()
    const result = await container.items.query<ChatMessageModel>(query).fetchAll()
    return {
      status: "OK",
      response: result.resources[0],
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const UpsertChatMessage = async (
  chatThreadId: string,
  message: ChatCompletionMessage,
  citations: string = ""
): ServerActionResponseAsync<ChatMessageModel> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const modelToSave: ChatMessageModel = {
      id: uniqueId(),
      createdAt: new Date(),
      type: ChatRecordType.Message,
      isDeleted: false,
      content: message.content ?? "",
      role: mapChatCompletionRoleToChatRole(message.role),
      chatThreadId,
      userId,
      tenantId,
      context: citations,
      systemPrompt: process.env.SYSTEM_PROMPT ?? "",
      feedback: FeedbackType.None,
      sentiment: ChatSentiment.Neutral,
      reason: "",
      contentSafetyWarning: "",
    }
    const container = await HistoryContainer()
    const { resource } = await container.items.upsert<ChatMessageModel>(modelToSave)

    if (!resource) {
      return {
        status: "ERROR",
        errors: [{ message: "Failed to save chat message" }],
      }
    }
    return {
      status: "OK",
      response: resource,
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const AddChatMessage = async (
  chatThreadId: string,
  message: ChatCompletionMessage,
  citations: string = ""
): ServerActionResponseAsync<ChatMessageModel> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const modelToSave: ChatMessageModel = {
      id: uniqueId(),
      createdAt: new Date(),
      type: ChatRecordType.Message,
      isDeleted: false,
      content: message.content ?? "",
      role: mapChatCompletionRoleToChatRole(message.role),
      chatThreadId,
      userId,
      tenantId,
      context: citations,
      systemPrompt: process.env.SYSTEM_PROMPT ?? "",
      feedback: FeedbackType.None,
      sentiment: ChatSentiment.Neutral,
      reason: "",
      contentSafetyWarning: "",
    }
    const container = await HistoryContainer()
    const { resource } = await container.items.upsert<ChatMessageModel>(modelToSave)

    if (!resource) {
      return {
        status: "ERROR",
        errors: [{ message: "Failed to save chat message" }],
      }
    }
    return {
      status: "OK",
      response: resource,
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const CreateUserFeedback = async (
  messageId: string,
  feedback: FeedbackType,
  sentiment: ChatSentiment,
  reason: string,
  chatThreadId: string
): ServerActionResponseAsync<ChatMessageModel> => {
  const message = await FindChatMessageForCurrentUser(chatThreadId, messageId)
  if (message.status !== "OK") return message

  const messageFeedback: ChatMessageModel = {
    ...message.response,
    feedback,
    sentiment,
    reason,
  }
  const container = await HistoryContainer()
  const { resource } = await container.items.upsert<ChatMessageModel>(messageFeedback)
  if (!resource)
    return {
      status: "ERROR",
      errors: [{ message: "Failed to save feedback" }],
    }

  return {
    status: "OK",
    response: resource,
  }
}

export const migrateChatMessagesForCurrentUser = async (
  userId: string,
  tenantId: string
): ServerActionResponseAsync<ChatMessageModel[]> => {
  try {
    const query: SqlQuerySpec = {
      query: "SELECT * FROM c WHERE c.userId=@userId AND c.tenantId=@tenantId AND c.threadId != null",
      parameters: [
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
      ],
    }

    const container = await HistoryContainer()
    const { resources } = await container.items
      .query<ChatMessageModel>(query, {
        partitionKey: [tenantId, userId],
      })
      .fetchAll()

    for (const resource of resources) {
      await container.item(resource.id, [tenantId, userId]).patch([
        { op: "add", path: "/chatThreadId", value: resource.threadId },
        { op: "remove", path: "/threadId", value: null },
      ])
    }

    return {
      status: "OK",
      response: resources,
    }
  } catch (error) {
    console.error("Error occurred during chat message migration: ", error)
    return {
      status: "ERROR",
      errors: [{ message: '"Updating your chat messages failed, please contact support"' }],
    }
  }
}
