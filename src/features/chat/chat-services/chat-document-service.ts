"use server";

import { getTenantId, userHashedId } from "@/features/auth/helpers";
import { CosmosDBContainer } from "@/features/common/cosmos";
import { uniqueId } from "@/features/common/util";
import { AnalyzeResult, AnalyzedDocument } from "@azure/ai-form-recognizer";
import { SqlQuerySpec } from "@azure/cosmos";
import { AzureCogDocumentIndex, indexDocuments } from "./azure-cog-search/azure-cog-vector-store";
import { CHAT_DOCUMENT_ATTRIBUTE, ChatDocumentModel, ServerActionResponse } from "./models";
import { chunkDocumentWithOverlap } from "./text-chunk";
import { isNotNullOrEmpty } from "./utils";
import { arrayBufferToBase64, customBeginAnalyzeDocument } from "./chat-document-helper";
import { speechToTextRecognizeOnce } from "./chat-audio-helper";

const MAX_DOCUMENT_SIZE = process.env.MAX_DOCUMENT_SIZE as unknown as number;

export const UploadDocument = async (formData: FormData): Promise<ServerActionResponse<string[]>> => {
  try {
    await ensureSearchIsConfigured();

    const chatType = formData.get("chatType") as string;
    let fileContent :string[];
    if(chatType === "audio"){
      const docs = await speechToTextRecognizeOnce(formData);
      const splitDocuments = chunkDocumentWithOverlap(docs.join("\n"));
      fileContent = splitDocuments;
    }
    else{
      const { docs } = await LoadFile(formData, chatType);
      const splitDocuments = chunkDocumentWithOverlap(docs.join("\n"));
      fileContent = splitDocuments;
        }
    return {
      success: true,
      error: "",
      response: fileContent,
    };
  } catch (e) {
    return {
      success: false,
      error: (e as Error).toString(),
      response: [],
    };
  }
};

const LoadFile = async (formData: FormData, chatType: string) => {
  try {
    const file: File | null = formData.get(chatType) as unknown as File;
    if (file) {
      if (chatType === "data" && file.type !== "application/pdf") {
        throw ("Invalid file format. Only PDF files are supported. File type provided: " + file.type);
      }

      if (file.size < MAX_DOCUMENT_SIZE) {
        // const client = initDocumentIntelligence();

        const blob = new Blob([file], { type: file.type });

        const base64String = await arrayBufferToBase64(await blob.arrayBuffer());

        const analyzeDocument = await customBeginAnalyzeDocument("prebuilt-read", base64String, "base64");
        
        // const poller = await client.beginAnalyzeDocument("prebuilt-read", await blob.arrayBuffer());
        // const { paragraphs } = await poller.pollUntilDone();

        const { paragraphs } = analyzeDocument as AnalyzeResult<AnalyzedDocument>;

        const docs: Array<string> = [];

        if (paragraphs) {
          for (const paragraph of paragraphs) {
            docs.push(paragraph.content);
          }
        }

        return { docs };
      } else {
        throw ("File size exceeds the maximum limit.");
      }
    } else {
      throw ("No file provided.");
    }
  } catch (e) {
    const error = e as any;
    throw new Error(error);
  }
};


export const IndexDocuments = async (fileName: string, docs: string[], chatThreadId: string, order: number): Promise<ServerActionResponse<AzureCogDocumentIndex[]>> => {
  try {
    const documentsToIndex: AzureCogDocumentIndex[] = [];
    const userId = await userHashedId();
    const tenantId = await getTenantId();

    for (let i = 0; i < docs.length; i++) {
      const docContent = docs[i];
      const docToAdd: AzureCogDocumentIndex = {
        id: uniqueId(),
        chatThreadId,
        userId: userId,
        pageContent: docContent,
        order: order,
        metadata: fileName,
        tenantId: tenantId,
        createdDate: new Date().toISOString(),
        fileName: fileName,
        embedding: [],
      };

      documentsToIndex.push(docToAdd);
    }
    
    await indexDocuments(documentsToIndex);

    await UpsertChatDocument(fileName, chatThreadId);
    return {
      success: true,
      error: "",
      response: documentsToIndex,
    };
  } catch (e) {
    return {
      success: false,
      error: (e as Error).toString(),
      response: [],
    };
  }
};

// export const initDocumentIntelligence = () => {
//   const client = new DocumentAnalysisClient(
//     process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
//     new AzureKeyCredential(process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY)
//   );
//   return client;
// };

export const FindAllChatDocuments = async (chatThreadID: string) => {
  const container = await CosmosDBContainer.getInstance().getContainer();

  const querySpec: SqlQuerySpec = {
    query:
      "SELECT * FROM root r WHERE r.type=@type AND r.chatThreadId = @threadId AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.userId=@userId",
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
      { name: "@userId", value: await userHashedId() },
      { name: "@tenantId", value: await getTenantId() },
    ],
  };

  const { resources } = await container.items
    .query<ChatDocumentModel>(querySpec)
    .fetchAll();

  return resources;
};

export const UpsertChatDocument = async (
  fileName: string,
  chatThreadID: string
) => {
  const modelToSave: ChatDocumentModel = {
    chatThreadId: chatThreadID,
    id: uniqueId(),
    userId: await userHashedId(),
    createdAt: new Date(),
    type: CHAT_DOCUMENT_ATTRIBUTE,
    isDeleted: false,
    tenantId: await getTenantId(),
    name: fileName,
  };

  const container = await CosmosDBContainer.getInstance().getContainer();
  await container.items.upsert(modelToSave);
};

export const ensureSearchIsConfigured = async () => {
  var isSearchConfigured =
    isNotNullOrEmpty(process.env.AZURE_SEARCH_NAME) &&
    isNotNullOrEmpty(process.env.AZURE_SEARCH_API_KEY) &&
    isNotNullOrEmpty(process.env.AZURE_SEARCH_INDEX_NAME) &&
    isNotNullOrEmpty(process.env.AZURE_SEARCH_API_VERSION);

  if (!isSearchConfigured) {
    throw new Error("Azure search environment variables are not configured.");
  }

  var isDocumentIntelligenceConfigured =
    isNotNullOrEmpty(process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT) &&
    isNotNullOrEmpty(process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY);

  if (!isDocumentIntelligenceConfigured) {
    throw new Error(
      "Azure document intelligence environment variables are not configured."
    );
  }

  var isEmbeddingsConfigured = isNotNullOrEmpty(
    process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME
  );

  if (!isEmbeddingsConfigured) {
    throw new Error("Azure openai embedding variables are not configured.");
  }

//  await ensureIndexIsCreated();
};
