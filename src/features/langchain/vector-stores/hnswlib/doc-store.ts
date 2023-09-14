import { Document } from "langchain/document";
import { Embeddings } from "langchain/embeddings/base";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { DocumentType, DocumentVectorStore } from "../store";

import * as fs from "node:fs";
import os from "node:os";
import * as path from "node:path";

const DB_FILE = path.join(os.tmpdir(), "hnswlib-chatgpt");

/**
 * Represents a document vector store that uses the HNSWLib library for similarity search. Persists the vector store to disk to the DB_FILE. Doesn't support any file locking. Only use for testing / development.
 * @template TModel The type of the documents stored in the vector store.
 */
export class HNSWLibStore<TModel extends DocumentType>
  implements DocumentVectorStore<TModel>
{
  private vectorStore: HNSWLib;

  constructor(vectorStore: HNSWLib) {
    this.vectorStore = vectorStore;
  }

  static async build<TModel extends DocumentType>(
    embedding: Embeddings
  ): Promise<DocumentVectorStore<TModel>> {
    let vectorStore: HNSWLib;
    if (fs.existsSync(DB_FILE)) {
      try {
        vectorStore = await HNSWLib.load(DB_FILE, embedding);
      } catch (err) {
        console.error("Error loading vector DB state. Reset state.", err);
        vectorStore = await HNSWLib.fromDocuments([], embedding);
      }
    } else {
      vectorStore = await HNSWLib.fromDocuments([], embedding);
    }
    return new HNSWLibStore(vectorStore);
  }

  async similaritySearch(
    query: string,
    k: number,
    userId: string,
    chatThreadId: string
  ) {
    // TODO: filter by userId and chatThreadId
    return (await this.vectorStore.similaritySearch(
      query,
      k
    )) as Document<TModel>[];
  }

  async addDocuments(documentsToIndex: Document<TModel>[]) {
    await this.vectorStore.addDocuments(documentsToIndex);
    await this.vectorStore.save(DB_FILE);
  }

  async deleteDocuments(chatThreadId: string): Promise<void> {
    console.log("[HNSWLibStore] TODO: implement deleteDocuments");
  }

  async ensureIndexIsCreated(): Promise<void> {
    console.log(
      "[HNSWLibStore] ensureIndexIsCreated called - noop - HNSWLib doesn't need index creation"
    );
  }
}
