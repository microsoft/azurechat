import database from "@/features/common/database";
import { OpenAIEmbeddingInstance, OpenAIInstance } from "@/features/common/openai";
import { ChatDocument, DocumentEmbedding } from "@prisma/client";

export interface AzureCogDocumentIndex {
  id: string;
  pageContent: string;
  embedding?: number[];
  user: string;
  chatThreadId: string;
  metadata: string;
}

interface DocumentSearchResponseModel<TModel> {
  value: TModel[];
}

type DocumentSearchModel = {
  "@search.score": number;
};

type DocumentDeleteModel = {
  id: string;
  "@search.action": "delete";
};

export interface AzureCogDocument {}

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
};

type AzureCogRequestObject = {
  search: string;
  facets: string[];
  filter: string;
  vectors: AzureCogVectorField[];
  top: number;
};

export const simpleSearch = async (
  id: string,
): Promise<ChatDocument> => {
  const result = await database.chatDocument.findFirst({
    where: {
      id: id,
    },
  });
  if (!result) {
    throw new Error("Document not found");
  }
  return result;
};

export const similaritySearchVectorWithScore = async (
  query: string,
  k: number,
  chatThreadId: string,
): Promise<DocumentEmbedding[]> => {
  const openai = OpenAIInstance();

  const embeddingsResult = await openai.embeddings.create({
    input: query,
    model: "text-embedding-ada-002"
  });

  const embeddings = embeddingsResult.data.map((item) => {
    return item.embedding;
  });

  const embeddingsString = embeddings.map((item) => {
    return item.join(",")
  });

  // SELECT * FROM items WHERE category_id = 123 ORDER BY embedding <-> '[3,1,2]' LIMIT 5;

  // model DocumentEmbedding {
  //   id            String    @id @default(uuid())
  //   content       String
  //   contentLength Int       @map("content_length")
  //   contentTokens Int       @map("content_tokens")
  //   embedding     Unsupported("vector(1536)")?
  
  //   document      ChatDocument @relation(fields: [documentId], references: [id])
  //   documentId    String       @map("document_id")
  
  //   @@map("document_embedding")
  // }

  const result = await database.$queryRaw`
  SELECT e.id, content, content_length, content_tokens, document_id, file_name
  FROM document_embedding e join chat_document cd on e.document_id = cd.id
  WHERE document_id IN (
    SELECT id
    FROM chat_document
    WHERE chat_thread_id = ${chatThreadId}
  )
  ORDER BY embedding <=> ${embeddings[0]}::vector LIMIT ${k};
  ` as any[];

  const mapResult = result.map((item) => {
    return {
      id: item.id,
      content: item.content,
      contentLength: item.content_length,
      contentTokens: item.content_tokens,
      documentId: item.document_id,
      fileName: item.file_name,
    };
  }) as DocumentEmbedding[];

  return mapResult;
  
};



export const deleteDocuments = async (chatThreadId: string): Promise<void> => {
  // find all documents for chat thread

  const documents = await database.chatDocument.findMany({
    where: {
      chatThreadId: chatThreadId,
    },
  });

  for (const document of documents) {
    await database.documentEmbedding.deleteMany({
      where: {
        documentId: document.id,
      },
    });

    await database.chatDocument.delete({
      where: {
        id: document.id,
      },
    });
  }
};