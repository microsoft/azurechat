"use server";

import { userHashedId } from "@/features/auth/helpers";
import { CosmosDBContainer } from "@/features/common/cosmos";
import { AzureCogSearch } from "@/features/langchain/vector-stores/azure-cog-search/azure-cog-vector-store";
import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";
import { SqlQuerySpec } from "@azure/cosmos";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { nanoid } from "nanoid";
import {
  CHAT_DOCUMENT_ATTRIBUTE,
  ChatDocumentModel,
  FaqDocumentIndex,
  ServerActionResponse,
} from "./models";
import { isNotNullOrEmpty } from "./utils";

const MAX_DOCUMENT_SIZE = 20000000;

export const UploadDocument = async (
  formData: FormData
): Promise<ServerActionResponse<string[]>> => {
  try {
    await ensureSearchIsConfigured();

    const { docs } = await LoadFile(formData);
    const splitDocuments = await SplitDocuments(docs);
    const docPageContents = splitDocuments.map((item) => item.pageContent);

    return {
      success: true,
      error: "",
      response: docPageContents,
    };
  } catch (e) {
    return {
      success: false,
      error: (e as Error).message,
      response: [],
    };
  }
};

const LoadFile = async (formData: FormData) => {
  try {
    const file: File | null = formData.get("file") as unknown as File;

    if (file && file.size < MAX_DOCUMENT_SIZE) {
      const client = initDocumentIntelligence();

      const blob = new Blob([file], { type: file.type });

      const poller = await client.beginAnalyzeDocument(
        "prebuilt-read",
        await blob.arrayBuffer()
      );
      const { paragraphs } = await poller.pollUntilDone();

      const docs: Document[] = [];

      if (paragraphs) {
        for (const paragraph of paragraphs) {
          const doc: Document = {
            pageContent: paragraph.content,
            metadata: {
              file: file.name,
            },
          };
          docs.push(doc);
        }
      }

      return { docs };
    }
  } catch (e) {
    const error = e as any;

    if (error.details) {
      if (error.details.length > 0) {
        throw new Error(error.details[0].message);
      } else {
        throw new Error(error.details.error.innererror.message);
      }
    }

    throw new Error(error.message);
  }

  throw new Error("Invalid file format or size. Only PDF files are supported.");
};

const SplitDocuments = async (docs: Array<Document>) => {
  const allContent = docs.map((doc) => doc.pageContent).join("\n");
  const splitter = new RecursiveCharacterTextSplitter();
  const output = await splitter.createDocuments([allContent]);
  return output;
};

export const DeleteDocuments = async (chatThreadId: string) => {
  try {
    const vectorStore = initAzureSearchVectorStore();
    await vectorStore.deleteDocuments(chatThreadId);
  } catch (e) {
    return {
      success: false,
      error: (e as Error).message,
      response: [],
    };
  }
};

export const IndexDocuments = async (
  fileName: string,
  docs: string[],
  chatThreadId: string
): Promise<ServerActionResponse<FaqDocumentIndex[]>> => {
  try {
    const vectorStore = initAzureSearchVectorStore();

    const documentsToIndex: FaqDocumentIndex[] = [];
    let index = 0;
    for (const doc of docs) {
      const docToAdd: FaqDocumentIndex = {
        id: nanoid(),
        chatThreadId,
        user: await userHashedId(),
        pageContent: doc,
        metadata: fileName,
        embedding: [],
      };

      documentsToIndex.push(docToAdd);
      index++;
    }

    await vectorStore.addDocuments(documentsToIndex);

    await UpsertChatDocument(fileName, chatThreadId);
    return {
      success: true,
      error: "",
      response: documentsToIndex,
    };
  } catch (e) {
    return {
      success: false,
      error: (e as Error).message,
      response: [],
    };
  }
};

export const initAzureSearchVectorStore = () => {
  const embedding = new OpenAIEmbeddings();
  const azureSearch = new AzureCogSearch<FaqDocumentIndex>(embedding, {
    name: process.env.AZURE_SEARCH_NAME,
    indexName: process.env.AZURE_SEARCH_INDEX_NAME,
    apiKey: process.env.AZURE_SEARCH_API_KEY,
    apiVersion: process.env.AZURE_SEARCH_API_VERSION,
    vectorFieldName: "embedding",
  });

  return azureSearch;
};

export const initDocumentIntelligence = () => {
  const client = new DocumentAnalysisClient(
    process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
    new AzureKeyCredential(process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY)
  );

  return client;
};

export const FindAllChatDocuments = async (chatThreadID: string) => {
  const container = await CosmosDBContainer.getInstance().getContainer();

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
    id: nanoid(),
    userId: await userHashedId(),
    createdAt: new Date(),
    type: CHAT_DOCUMENT_ATTRIBUTE,
    isDeleted: false,
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

  const vectorStore = initAzureSearchVectorStore();
  await vectorStore.ensureIndexIsCreated();
};
