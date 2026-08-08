"use server";
import "server-only";

import { userHashedId } from "@/features/auth-page/helpers";
import { HistoryContainer } from "@/features/common/services/cosmos";

import { RevalidateCache } from "@/features/common/navigation-helpers";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { DocumentIntelligenceInstance } from "@/features/common/services/document-intelligence";
import { uniqueId } from "@/features/common/util";
import { SqlQuerySpec } from "@azure/cosmos";
import { EnsureIndexIsCreated } from "./azure-ai-search/azure-ai-search";
import { CHAT_DOCUMENT_ATTRIBUTE, ChatDocumentModel } from "./models";

const MAX_UPLOAD_DOCUMENT_SIZE: number = 20000000;
const CHUNK_SIZE = 2300;
const CHUNK_OVERLAP = CHUNK_SIZE * 0.25;

const debug = process.env.DEBUG === "true";

export const CrackDocument = async (
  formData: FormData
): Promise<ServerActionResponse<string[]>> => {
  try {
    if (debug) console.log("CrackDocument: Ensuring index is created.");
    const response = await EnsureIndexIsCreated();
    if (response.status === "OK") {
      if (debug) console.log("CrackDocument: Index is created, loading file.");
      const fileResponse = await LoadFile(formData);
      if (fileResponse.status === "OK") {
        if (debug) console.log("CrackDocument: File loaded successfully, splitting documents.");
        const splitDocuments = await ChunkDocumentWithOverlap(
          fileResponse.response.join("\n")
        );

        if (debug) console.log("CrackDocument: Documents split successfully.");
        return {
          status: "OK",
          response: splitDocuments,
        };
      }

      console.error("CrackDocument: File loading failed.", fileResponse.errors);
      return fileResponse;
    }

    console.error("CrackDocument: Index creation failed.", response.errors);
    return response;
  } catch (e) {
    console.error("CrackDocument error:", e);
    return {
      status: "ERROR",
      errors: [
        {
          message: `${e}`,
        },
      ],
    };
  }
};

const LoadFile = async (
  formData: FormData
): Promise<ServerActionResponse<string[]>> => {
  try {
    if (debug) console.log("LoadFile: Loading file from form data.");
    const file: File | null = formData.get("file") as unknown as File;

    const fileSize = process.env.MAX_UPLOAD_DOCUMENT_SIZE
      ? Number(process.env.MAX_UPLOAD_DOCUMENT_SIZE)
      : MAX_UPLOAD_DOCUMENT_SIZE;

    if (file && file.size < fileSize) {
      if (debug) console.log("LoadFile: File size is within the acceptable limit.");
      const client = DocumentIntelligenceInstance();

      const blob = new Blob([file], { type: file.type });

      if (debug) console.log("LoadFile: Beginning document analysis.");
      const poller = await client.beginAnalyzeDocument(
        "prebuilt-read",
        await blob.arrayBuffer()
      );
      const { paragraphs } = await poller.pollUntilDone();

      const docs: Array<string> = [];

      if (paragraphs) {
        for (const paragraph of paragraphs) {
          docs.push(paragraph.content);
        }
        if (debug) console.log("LoadFile: Document analysis completed successfully.");
      }

      return {
        status: "OK",
        response: docs,
      };
    } else {
      console.error("LoadFile: File size is too large.");
      return {
        status: "ERROR",
        errors: [
          {
            message: `File is too large and must be less than ${MAX_UPLOAD_DOCUMENT_SIZE} bytes.`,
          },
        ],
      };
    }
  } catch (e) {
    console.error("LoadFile error:", e);
    return {
      status: "ERROR",
      errors: [
        {
          message: `${e}`,
        },
      ],
    };
  }
};

export const FindAllChatDocuments = async (
  chatThreadID: string
): Promise<ServerActionResponse<ChatDocumentModel[]>> => {
  try {
    if (debug) console.log("FindAllChatDocuments: Searching documents for chatThreadID:", chatThreadID);
    const querySpec: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.type=@type AND r.chatThreadId = @threadId AND r.isDeleted=@isDeleted",
      parameters: [
        {
          name: "@type",
          value: CHAT_DOCUMENT_ATTRIBUTE,
        },
        {
          name: "@threadId",
          value: chatThreadID,
        },
        {
          name: "@isDeleted",
          value: false,
        },
      ],
    };

    const { resources } = await HistoryContainer()
      .items.query<ChatDocumentModel>(querySpec)
      .fetchAll();

    if (resources) {
      if (debug) console.log(`FindAllChatDocuments: ${resources.length} Documents found.`);
      return {
        status: "OK",
        response: resources,
      };
    } else {
      console.error("FindAllChatDocuments: No documents found.");
      return {
        status: "ERROR",
        errors: [
          {
            message: "No documents found",
          },
        ],
      };
    }
  } catch (e) {
    console.error("FindAllChatDocuments error:", e);
    return {
      status: "ERROR",
      errors: [
        {
          message: `${e}`,
        },
      ],
    };
  }
};

export const CreateChatDocument = async (
  fileName: string,
  chatThreadID: string
): Promise<ServerActionResponse<ChatDocumentModel>> => {
  try {
    if (debug) console.log("CreateChatDocument: Creating document with fileName:", fileName, "chatThreadID:", chatThreadID);
    const modelToSave: ChatDocumentModel = {
      chatThreadId: chatThreadID,
      id: uniqueId(),
      userId: await userHashedId(),
      createdAt: new Date(),
      type: CHAT_DOCUMENT_ATTRIBUTE,
      isDeleted: false,
      name: fileName,
    };

    const { resource } = await HistoryContainer().items.upsert<ChatDocumentModel>(modelToSave);
    RevalidateCache({
      page: "chat",
      params: chatThreadID,
    });

    if (resource) {
      if (debug) console.log("CreateChatDocument: Document created successfully.");
      return {
        status: "OK",
        response: resource,
      };
    }

    console.error("CreateChatDocument: Unable to save chat document.");
    return {
      status: "ERROR",
      errors: [
        {
          message: "Unable to save chat document",
        },
      ],
    };
  } catch (e) {
    console.error("CreateChatDocument error:", e);
    return {
      status: "ERROR",
      errors: [
        {
          message: `${e}`,
        },
      ],
    };
  }
};

export async function ChunkDocumentWithOverlap(
  document: string
): Promise<string[]> {
  if (debug) console.log("ChunkDocumentWithOverlap: Starting chunking process.");
  const chunks: string[] = [];

  if (document.length <= CHUNK_SIZE) {
    if (debug) console.log("ChunkDocumentWithOverlap: Document length is within single chunk size.");
    chunks.push(document);
    return chunks;
  }

  let startIndex = 0;

  while (startIndex < document.length) {
    const endIndex = startIndex + CHUNK_SIZE;
    const chunk = document.substring(startIndex, endIndex);
    chunks.push(chunk);
    startIndex = endIndex - CHUNK_OVERLAP;
  }

  if (debug) console.log("ChunkDocumentWithOverlap: Chunking completed.", chunks);
  return chunks;
}
