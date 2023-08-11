import { Callbacks } from "langchain/callbacks";
import { Document } from "langchain/document";
import { Embeddings } from "langchain/embeddings/base";
import { VectorStore } from "langchain/vectorstores/base";
import { nanoid } from "nanoid";

// example index model below
// export interface AzureCogDocumentIndex extends Record<string, unknown> {
//     id: string;
//     content: string;
//     user: string;
//     embedding?: number[];
//     pageContent: string;
//     metadata: any;
//   }

interface AzureSearchConfig {
  name: string;
  indexName: string;
  apiKey: string;
  apiVersion: string;
  vectorFieldName: string;
}

interface DocumentSearchResponseModel<TModel> {
  value: TModel[];
}

type DocumentSearchModel = {
  "@search.score": number;
};

export interface AzureCogDocument extends Record<string, unknown> {}

type AzureCogVectorField = {
  value: number[];
  fields: string;
  k: number;
};

type AzureCogFilter = {
  search?: string;
  facets?: string[];
  filter?: string;
  top?: number;
  vectorFields: string;
};

type AzureCogRequestObject = {
  search: string;
  facets: string[];
  filter: string;
  vectors: AzureCogVectorField[];
  top: number;
};

export class AzureCogSearch<
  TModel extends Record<string, unknown>
> extends VectorStore {
  private _config: AzureSearchConfig;

  constructor(embeddings: Embeddings, dbConfig: AzureSearchConfig) {
    super(embeddings, dbConfig);
    this._config = dbConfig;
  }

  _vectorstoreType(): string {
    return "azure-cog-search";
  }

  get config(): AzureSearchConfig {
    return this._config;
  }

  get baseUrl(): string {
    return `https://${this._config.name}.search.windows.net/indexes/${this._config.indexName}/docs`;
  }

  async addDocuments(documents: Document<TModel>[]): Promise<string[]> {
    const texts = documents.map(({ pageContent }) => pageContent);
    return this.addVectors(
      await this.embeddings.embedDocuments(texts),
      documents
    );
  }

  /**
   * Search for the most similar documents to a query
   */
  async similaritySearch(
    query: string,
    k?: number,
    filter?: AzureCogFilter
  ): Promise<Document<TModel>[]> {
    const results = await this.similaritySearchVectorWithScore(
      await this.embeddings.embedQuery(query),
      k || 4,
      filter
    );

    return results.map(([doc, _score]) => doc);
  }

  /**
   * Search for the most similar documents to a query,
   * and return their similarity score
   */
  async similaritySearchWithScore(
    query: string,
    k?: number,
    filter?: AzureCogFilter,
    _callbacks: Callbacks | undefined = undefined
  ): Promise<[Document<TModel>, number][]> {
    const embeddings = await this.embeddings.embedQuery(query);
    return this.similaritySearchVectorWithScore(embeddings, k || 5, filter);
  }

  /**
   * Advanced: Add more documents to an existing VectorStore,
   * when you already have their embeddings
   */
  async addVectors(
    vectors: number[][],
    documents: Document<TModel>[]
  ): Promise<string[]> {
    const indexes: Array<any> = [];

    documents.forEach((document, i) => {
      indexes.push({
        id: nanoid().replace("_", ""),
        ...document,
        [this._config.vectorFieldName]: vectors[i],
      });
    });

    // run through indexes and if the id has _ then remove it
    indexes.forEach((index) => {
      if (index.id.includes("_")) {
        index.id = index.id.replace("_", "");
      }
    });

    const documentIndexRequest: DocumentSearchResponseModel<TModel> = {
      value: indexes,
    };

    const url = `${this.baseUrl}/index?api-version=${this._config.apiVersion}`;
    const responseObj = await fetcher(
      url,
      documentIndexRequest,
      this._config.apiKey
    );
    return responseObj.value.map((doc: any) => doc.key);
  }

  /**
   * Advanced: Search for the most similar documents to a query,
   * when you already have the embedding of the query
   */
  async similaritySearchVectorWithScore(
    query: number[],
    k: number,
    filter?: AzureCogFilter
  ): Promise<[Document<TModel>, number][]> {
    const url = `${this.baseUrl}/search?api-version=${this._config.apiVersion}`;

    const searchBody: AzureCogRequestObject = {
      search: filter?.search || "*",
      facets: filter?.facets || [],
      filter: filter?.filter || "",
      vectors: [{ value: query, fields: filter?.vectorFields || "", k: k }],
      top: filter?.top || k,
    };

    const resultDocuments = (await fetcher(
      url,
      searchBody,
      this._config.apiKey
    )) as DocumentSearchResponseModel<Document<TModel> & DocumentSearchModel>;

    return resultDocuments.value.map((doc) => [doc, doc["@search.score"] || 0]);
  }
}

const fetcher = async (url: string, body: any, apiKey: string) => {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    console.log(err);
    throw new Error(JSON.stringify(err));
  }

  return await response.json();
};
