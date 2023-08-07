"use server";

import { userHashedId } from "@/features/auth/helpers";
import { AzureCogSearch } from "@/features/langchain/vector-stores/azure-cog-search/azure-cog-vector-store";
import { Document } from "langchain/document";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { nanoid } from "nanoid";
import { FaqDocumentIndex } from "./models";

export const UploadDocument = async (formData: FormData) => {
  const { docs, file, chatThreadId } = await LoadFile(formData);
  const splitDocuments = await SplitDocuments(docs);
  const docPageContents = splitDocuments.map((item) => item.pageContent);
  await IndexDocuments(file, docPageContents, chatThreadId);
  return file.name;
};

const LoadFile = async (formData: FormData) => {
  const file: File | null = formData.get("file") as unknown as File;
  const chatThreadId: string = formData.get("id") as unknown as string;
  if (file && file.type === "application/pdf" && file.size < 20000000) {
    const loader = new PDFLoader(file, { splitPages: false });
    const docs = await loader.load();
    return { docs, file, chatThreadId };
  }
  throw new Error("Invalid file format or size. Only PDF files are supported.");
};

const SplitDocuments = async (docs: Array<Document>) => {
  const splitDocuments: Array<Document> = [];
  for (const doc of docs) {
    const splitter = new RecursiveCharacterTextSplitter();
    const output = await splitter.createDocuments([doc.pageContent]);
    splitDocuments.push(...output);
  }
  return splitDocuments;
};

const IndexDocuments = async (
  file: File,
  docs: string[],
  chatThreadId: string
) => {
  const vectorStore = initAzureSearchVectorStore();
  const documentsToIndex: FaqDocumentIndex[] = [];
  let index = 0;
  for (const doc of docs) {
    const docToAdd: FaqDocumentIndex = {
      id: nanoid(),
      chatThreadId,
      user: await userHashedId(),
      pageContent: doc,
      metadata: file.name,
      embedding: [],
    };

    documentsToIndex.push(docToAdd);
    index++;
  }

  await vectorStore.addDocuments(documentsToIndex);
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
