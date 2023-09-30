import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaqDocumentIndex } from "@/features/chat/chat-services/models";
import { AzureCogSearchStore } from "./azure-cog-search/doc-store";
import { HNSWLibStore } from "./hnswlib/doc-store";
import { Document } from "langchain/document";

export interface DocumentType extends Record<string, unknown> {}

export interface DocumentVectorStore<TModel extends DocumentType> {
  ensureIndexIsCreated(): Promise<void>;
  deleteDocuments(chatThreadId: string): Promise<void>;
  similaritySearch(
    query: string,
    k: number,
    userId: string,
    chatThreadId: string
  ): Promise<Document<TModel>[]>;
  addDocuments(documentsToIndex: Document<TModel>[]): Promise<void>;
}

export const initVectorStore = async () => {
  const embedding = new OpenAIEmbeddings();
  if (process.env.AZURE_SEARCH_NAME) {
    return await AzureCogSearchStore.build<FaqDocumentIndex>(embedding);
  } else {
    // if azure cog search is not configured, use hnswlib as a fallback
    return await HNSWLibStore.build<FaqDocumentIndex>(embedding);
  }
};
