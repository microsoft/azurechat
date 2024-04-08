"use server"
import "server-only"
import { SqlQuerySpec } from "@azure/cosmos"

import { FindAllChatDocumentsForCurrentUser } from "./chat-document-service"
import { FindAllChatMessagesForCurrentUser } from "./chat-message-service"

import { getCurrentUser, getTenantId, userHashedId, userSession } from "@/features/auth/helpers"
import { deleteDocuments } from "@/features/chat/chat-services/azure-cog-search/azure-cog-vector-store"
import { DEFAULT_MONTHS_AGO } from "@/features/chat/constants"
import {
  ChatMessageModel,
  ChatRecordType,
  ChatRole,
  ChatSentiment,
  ChatThreadModel,
  ChatType,
  ConversationSensitivity,
  ConversationStyle,
  FeedbackType,
  PromptGPTProps,
} from "@/features/chat/models"
import { xMonthsAgo } from "@/features/common/date-helper"
import { RedirectToChatThread } from "@/features/common/navigation-helpers"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { HistoryContainer } from "@/features/common/services/cosmos"
import { uniqueId } from "@/lib/utils"

export const FindAllChatThreadForCurrentUser = async (): ServerActionResponseAsync<ChatThreadModel[]> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.type=@type AND r.isDeleted=@isDeleted AND r.userId=@userId AND r.tenantId=@tenantId AND r.createdAt >= @createdAt ORDER BY r.createdAt DESC",
      parameters: [
        { name: "@type", value: ChatRecordType.Thread },
        { name: "@isDeleted", value: false },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
        { name: "@createdAt", value: xMonthsAgo(DEFAULT_MONTHS_AGO) },
      ],
    }
    const container = await HistoryContainer()
    const { resources } = await container.items
      .query<ChatThreadModel>(query, {
        partitionKey: [tenantId, userId],
      })
      .fetchAll()
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

export const FindChatThreadForCurrentUser = async (
  chatThreadId: string
): ServerActionResponseAsync<ChatThreadModel> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.id=@id AND r.type=@type AND r.isDeleted=@isDeleted AND r.userId=@userId AND r.tenantId=@tenantId AND r.createdAt >= @createdAt",
      parameters: [
        { name: "@id", value: chatThreadId },
        { name: "@type", value: ChatRecordType.Thread },
        { name: "@isDeleted", value: false },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
        { name: "@createdAt", value: xMonthsAgo(DEFAULT_MONTHS_AGO) },
      ],
    }
    const container = await HistoryContainer()
    const { resources } = await container.items
      .query<ChatThreadModel>(query, {
        partitionKey: [tenantId, userId],
      })
      .fetchAll()

    if (!resources.length)
      return {
        status: "NOT_FOUND",
        errors: [{ message: "Chat thread not found" }],
      }

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

export const UpdateChatThreadTitle = async (
  chatThreadId: string,
  newTitle: string
): ServerActionResponseAsync<ChatThreadModel> => {
  try {
    const response = await FindChatThreadForCurrentUser(chatThreadId)
    if (response.status !== "OK") return response
    const chatThread = response.response
    chatThread.previousChatName = chatThread.name
    chatThread.name = newTitle.substring(0, 30)
    return await UpsertChatThread(chatThread)
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const SoftDeleteChatThreadForCurrentUser = async (
  chatThreadId: string
): ServerActionResponseAsync<ChatThreadModel> => {
  try {
    const chatThreadResponse = await FindChatThreadForCurrentUser(chatThreadId)
    if (chatThreadResponse.status !== "OK") return chatThreadResponse

    const chatMessagesResponse = await FindAllChatMessagesForCurrentUser(chatThreadId)
    if (chatMessagesResponse.status !== "OK") return chatMessagesResponse

    const container = await HistoryContainer()

    const chatMessagesPromises = chatMessagesResponse.response.map(
      async chat => await container.items.upsert({ ...chat, isDeleted: true })
    )
    await Promise.all(chatMessagesPromises)

    const chatDocumentsResponse = await FindAllChatDocumentsForCurrentUser(chatThreadId)
    if (chatDocumentsResponse.status !== "OK") return chatDocumentsResponse
    if (chatDocumentsResponse.response.length) {
      const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
      await deleteDocuments(chatThreadId, userId, tenantId)
      const chatDocumentsPromises = chatDocumentsResponse.response.map(
        async chat => await container.items.upsert({ ...chat, isDeleted: true })
      )
      await Promise.all(chatDocumentsPromises)
    }

    await container.items.upsert({ ...chatThreadResponse.response, isDeleted: true })
    return {
      status: "OK",
      response: chatThreadResponse.response,
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const UpsertChatThread = async (chatThread: ChatThreadModel): ServerActionResponseAsync<ChatThreadModel> => {
  try {
    if (chatThread.id) {
      const response = await EnsureChatThreadOperation(chatThread.id)
      if (response.status !== "OK") return response
    }

    const container = await HistoryContainer()
    const { resource } = await container.items.upsert<ChatThreadModel>(chatThread)

    if (resource) {
      return {
        status: "OK",
        response: resource,
      }
    }

    return {
      status: "ERROR",
      errors: [{ message: "Chat thread not found" }],
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

const EnsureChatThreadOperation = async (chatThreadID: string): ServerActionResponseAsync<ChatThreadModel> => {
  const response = await FindChatThreadForCurrentUser(chatThreadID)
  if (response.status !== "OK") return response

  const [currentUser, hashedId] = await Promise.all([getCurrentUser(), userHashedId()])
  if (!currentUser.qchatAdmin && response.response.userId !== hashedId)
    return {
      status: "ERROR",
      errors: [{ message: "Unauthorized access" }],
    }
  return response
}

export const CreateChatThread = async (): ServerActionResponseAsync<ChatThreadModel> => {
  try {
    const [userId, tenantId, session] = await Promise.all([userHashedId(), getTenantId(), userSession()])
    if (!session)
      return {
        status: "ERROR",
        errors: [{ message: "No active user session" }],
      }

    const id = uniqueId()
    const modelToSave: ChatThreadModel = {
      name: "New Chat",
      previousChatName: "",
      chatCategory: "Uncategorised",
      useName: session.name,
      userId,
      id,
      chatThreadId: id,
      tenantId,
      createdAt: new Date(),
      isDeleted: false,
      isDisabled: false,
      contentSafetyWarning: "",
      chatType: ChatType.Simple,
      conversationStyle: ConversationStyle.Precise,
      conversationSensitivity: ConversationSensitivity.Official,
      type: ChatRecordType.Thread,
      systemPrompt: "",
      contextPrompt: "",
      metaPrompt: "",
      chatOverFileName: "",
      prompts: [],
      selectedPrompt: "",
    }

    const container = await HistoryContainer()
    const { resource } = await container.items.upsert<ChatThreadModel>(modelToSave)
    if (!resource)
      return {
        status: "ERROR",
        errors: [{ message: "Chat thread not created" }],
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

export const InitChatSession = async (
  props: PromptGPTProps
): ServerActionResponseAsync<{
  chatThreadId: string
  updatedLastHumanMessage: ChatMessageModel
  chats: ChatMessageModel[]
  chatThread: ChatThreadModel
}> => {
  const { messages, id: chatThreadId, chatType, conversationStyle, conversationSensitivity, chatOverFileName } = props

  const lastHumanMessage = messages[messages.length - 1]

  const currentChatThreadResponse = await EnsureChatThreadOperation(chatThreadId)
  if (currentChatThreadResponse.status !== "OK") return currentChatThreadResponse

  const chatMessagesResponse = await FindAllChatMessagesForCurrentUser(chatThreadId)
  if (chatMessagesResponse.status !== "OK") return chatMessagesResponse

  const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])

  const updatedChatThreadResponse = await UpsertChatThread({
    ...currentChatThreadResponse.response,
    chatType: chatType,
    chatOverFileName: chatOverFileName,
    conversationStyle: conversationStyle,
    conversationSensitivity: conversationSensitivity,
  })
  if (updatedChatThreadResponse.status !== "OK") return updatedChatThreadResponse

  const updatedLastHumanMessage: ChatMessageModel = {
    ...lastHumanMessage,
    isDeleted: false,
    chatThreadId,
    userId: userId,
    tenantId: tenantId,
    context: "",
    originalCompletion: "",
    type: ChatRecordType.Message,
    feedback: FeedbackType.None,
    sentiment: ChatSentiment.Neutral,
    reason: "",
    systemPrompt: "",
    contentSafetyWarning: "",
    createdAt: new Date(),
    role: ChatRole.User,
  }

  return {
    status: "OK",
    response: {
      chatThreadId,
      updatedLastHumanMessage,
      chats: chatMessagesResponse.response,
      chatThread: currentChatThreadResponse.response,
    },
  }
}

export const FindChatThreadByTitleAndEmpty = async (
  title: string
): ServerActionResponseAsync<ChatThreadModel | undefined> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.type=@type AND r.userId=@userId AND r.name=@name AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.createdAt >= @createdAt ORDER BY r.createdAt DESC",
      parameters: [
        { name: "@type", value: ChatRecordType.Thread },
        { name: "@name", value: title },
        { name: "@isDeleted", value: false },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
        { name: "@createdAt", value: xMonthsAgo(DEFAULT_MONTHS_AGO) },
      ],
    }
    const container = await HistoryContainer()
    const result = await container.items.query<ChatThreadModel>(query).fetchAll()

    if (!result.resources.length)
      return {
        status: "OK",
        response: undefined,
      }

    for (const chatThread of result.resources) {
      const messageResponse = await FindAllChatMessagesForCurrentUser(chatThread.chatThreadId)
      if (messageResponse.status !== "OK") return messageResponse
      if (messageResponse.response.length === 0)
        return {
          status: "OK",
          response: chatThread,
        }
    }

    return {
      status: "OK",
      response: undefined,
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const UpdateChatThreadCreatedAt = async (chatThreadId: string): ServerActionResponseAsync<ChatThreadModel> => {
  try {
    const threadResponse = await FindChatThreadForCurrentUser(chatThreadId)
    if (threadResponse.status !== "OK") return threadResponse

    const threadToUpdate = {
      ...threadResponse.response,
      createdAt: new Date(),
      chatType: ChatType.Simple,
      conversationStyle: ConversationStyle.Precise,
      conversationSensitivity: ConversationSensitivity.Official,
      chatOverFileName: "",
      offenderId: "",
    }

    const container = await HistoryContainer()
    const { resource } = await container.items.upsert<ChatThreadModel>(threadToUpdate)
    if (!resource)
      return {
        status: "NOT_FOUND",
        errors: [{ message: "Chat thread could not be updated" }],
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

export const AssociateOffenderWithChatThread = async (
  chatThreadId: string,
  offenderId: string | undefined
): ServerActionResponseAsync<ChatThreadModel> => {
  const threadResponse = await FindChatThreadForCurrentUser(chatThreadId)
  if (threadResponse.status !== "OK") return threadResponse

  const threadToUpdate = {
    ...threadResponse.response,
    offenderId: offenderId,
  }
  const container = await HistoryContainer()
  const { resource } = await container.items.upsert<ChatThreadModel>(threadToUpdate)
  if (!resource)
    return {
      status: "NOT_FOUND",
      errors: [{ message: "Failed to associate offender with chat thread" }],
    }
  return {
    status: "OK",
    response: resource,
  }
}

export const CreateChatAndRedirect = async (): Promise<void> => {
  const response = await CreateChatThread()
  if (response.status !== "OK") return
  RedirectToChatThread(response.response.id)
}
