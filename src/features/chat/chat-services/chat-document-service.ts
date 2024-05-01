"use server"

import { SqlQuerySpec } from "@azure/cosmos"

import { getTenantId, userHashedId } from "@/features/auth/helpers"
import { DEFAULT_MONTHS_AGO, MAX_DOCUMENT_SIZE } from "@/features/chat/constants"
import { ChatDocumentModel, ChatRecordType } from "@/features/chat/models"
import { xMonthsAgo } from "@/features/common/date-helper"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { HistoryContainer } from "@/features/common/services/cosmos"
import { uniqueId } from "@/lib/utils"

import { AzureCogDocumentIndex, indexDocuments } from "./azure-cog-search/azure-cog-vector-store"
import { speechToTextRecognizeOnce } from "./chat-audio-helper"
import { arrayBufferToBase64, customBeginAnalyzeDocument } from "./chat-document-helper"
import { chunkDocumentWithOverlap } from "./text-chunk"
import { isNotNullOrEmpty } from "./utils"

const LoadFile = async (formData: FormData, chatType: string): Promise<string[]> => {
  try {
    const file: File | null = formData.get(chatType) as unknown as File
    if (!file) throw "No file provided."
    if (chatType === "data" && file.type !== "application/pdf")
      throw "Invalid file format. Only PDF files are supported. File type provided: " + file.type

    if (file.size >= MAX_DOCUMENT_SIZE) throw "File size exceeds the maximum limit."

    const blob = new Blob([file], { type: file.type })
    const base64String = await arrayBufferToBase64(await blob.arrayBuffer())
    const analyzeDocument = await customBeginAnalyzeDocument("prebuilt-read", base64String, "base64")
    if (!analyzeDocument) throw new Error("Failed to analyze document.")

    const { paragraphs } = analyzeDocument
    const docs = paragraphs?.map(paragraph => paragraph.content) ?? []
    return docs
  } catch (e: unknown) {
    const error = e as string | undefined
    throw new Error(error)
  }
}

const ensureSearchIsConfigured = (): boolean => {
  const isSearchConfigured =
    isNotNullOrEmpty(process.env.AZURE_SEARCH_NAME) &&
    isNotNullOrEmpty(process.env.APIM_KEY) &&
    isNotNullOrEmpty(process.env.AZURE_SEARCH_INDEX_NAME) &&
    isNotNullOrEmpty(process.env.AZURE_SEARCH_API_VERSION)

  if (!isSearchConfigured) {
    console.error("Azure search environment variables are not configured.")
    return false
  }

  const isDocumentIntelligenceConfigured =
    isNotNullOrEmpty(process.env.APIM_BASE) && isNotNullOrEmpty(process.env.APIM_KEY)

  if (!isDocumentIntelligenceConfigured) {
    console.error("Azure document intelligence environment variables are not configured.")
    return false
  }

  const isEmbeddingsConfigured = isNotNullOrEmpty(process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME)

  if (!isEmbeddingsConfigured) {
    console.error("Azure OpenAI Embedding variables are not configured.")
    return false
  }
  return true
}

export const UploadDocument = async (formData: FormData): ServerActionResponseAsync<[string[], string?]> => {
  try {
    const isConfigValid = ensureSearchIsConfigured()
    if (!isConfigValid) throw new Error("Azure Search is not configured")

    const chatType = formData.get("chatType") as string
    let fileContent: [string[], string?]
    if (chatType === "audio") {
      const docs = await speechToTextRecognizeOnce(formData)
      const splitDocuments = chunkDocumentWithOverlap(docs.join("\n"))
      fileContent = [splitDocuments, docs.join("\n")]
    } else {
      const docs = await LoadFile(formData, chatType)
      const splitDocuments = chunkDocumentWithOverlap(docs.join("\n"))
      fileContent = [splitDocuments, undefined]
    }
    return {
      status: "OK",
      response: fileContent,
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}

export const IndexDocuments = async (
  fileName: string,
  docs: string[],
  chatThreadId: string,
  order: number,
  contentsToSave?: string
): ServerActionResponseAsync<AzureCogDocumentIndex[]> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const documentsToIndex: AzureCogDocumentIndex[] = docs.map(docContent => ({
      id: uniqueId(),
      chatThreadId,
      userId,
      pageContent: docContent,
      order,
      metadata: fileName,
      tenantId,
      createdDate: new Date().toISOString(),
      fileName,
      embedding: [],
    }))
    await indexDocuments(documentsToIndex)

    const modelToSave: ChatDocumentModel = {
      chatThreadId,
      id: uniqueId(),
      userId,
      createdAt: new Date(),
      type: ChatRecordType.Document,
      isDeleted: false,
      tenantId,
      name: fileName,
      contents: contentsToSave,
    }
    const container = await HistoryContainer()
    const { resource } = await container.items.upsert<ChatDocumentModel>(modelToSave)
    if (!resource)
      return {
        status: "ERROR",
        errors: [{ message: "Chat document not created" }],
      }

    return {
      status: "OK",
      response: documentsToIndex,
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const FindAllChatDocumentsForCurrentUser = async (
  chatThreadId: string
): ServerActionResponseAsync<ChatDocumentModel[]> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.chatThreadId=@chatThreadId AND r.type=@type AND r.isDeleted=@isDeleted AND r.userId=@userId AND r.tenantId=@tenantId AND r.createdAt >= @createdAt ORDER BY r.createdAt DESC",
      parameters: [
        { name: "@chatThreadId", value: chatThreadId },
        { name: "@type", value: ChatRecordType.Document },
        { name: "@isDeleted", value: false },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
        { name: "@createdAt", value: xMonthsAgo(DEFAULT_MONTHS_AGO) },
      ],
    }
    const container = await HistoryContainer()
    const { resources } = await container.items
      .query<ChatDocumentModel>(query, {
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
