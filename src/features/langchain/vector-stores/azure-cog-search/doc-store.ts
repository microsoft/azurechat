import { AzureCogSearch } from "./azure-cog-vector-store";
import { Embeddings } from "langchain/embeddings/base";
import { Document } from "langchain/document";
import { DocumentVectorStore, DocumentType } from "../store";

export class AzureCogSearchStore<TModel extends DocumentType>
  implements DocumentVectorStore<TModel>
{
  private vectorStore: AzureCogSearch<TModel>;

  constructor(vectorStore: AzureCogSearch<TModel>) {
    this.vectorStore = vectorStore;
  }

  static async build<TModel extends DocumentType>(
    embedding: Embeddings
  ): Promise<DocumentVectorStore<TModel>> {
    const vectorStore = new AzureCogSearch<TModel>(embedding, {
      name: process.env.AZURE_SEARCH_NAME,
      indexName: process.env.AZURE_SEARCH_INDEX_NAME,
      apiKey: process.env.AZURE_SEARCH_API_KEY,
      apiVersion: process.env.AZURE_SEARCH_API_VERSION,
      vectorFieldName: "embedding",
    });
    return new AzureCogSearchStore<TModel>(vectorStore);
  }

  async similaritySearch(
    query: string,
    k: number,
    userId: string,
    chatThreadId: string
  ) {
    return await this.vectorStore.similaritySearch(query, k, {
      vectorFields: this.vectorStore.config.vectorFieldName,
      filter: `user eq '${userId}' and chatThreadId eq '${chatThreadId}'`,
    });
  }

  async addDocuments(documentsToIndex: Document<TModel>[]) {
    await this.vectorStore.addDocuments(documentsToIndex);
  }

  async deleteDocuments(chatThreadId: string): Promise<void> {
    await this.vectorStore.deleteDocuments(chatThreadId);
  }

  async ensureIndexIsCreated(): Promise<void> {
    await this.vectorStore.ensureIndexIsCreated();
  }
}
