"use server";

import { userHashedId } from "@/features/auth/helpers";

import { uniqueId } from "@/features/common/util";

import {
  CHAT_DOCUMENT_ATTRIBUTE,
  ServerActionResponse,
} from "./models";
import database from "@/features/common/database";
import { ChatDocument } from "@prisma/client";
import { OpenAIInstance } from "../../common/openai";
import { encode } from "@nem035/gpt-3-encoder";

const MAX_DOCUMENT_SIZE = 20000000;

const DEFAULT_PARSR_CONFIG = {
  version: 0.9,
  extractor: {
    pdf: "pdfminer",
    ocr: "tesseract",
    language: ["eng"],
  },
  cleaner: [
    "drawing-detection",
    [
      "image-detection",
      {
        ocrImages: false,
      },
    ],
    "out-of-page-removal",
    [
      "whitespace-removal",
      {
        minWidth: 0,
      },
    ],
    [
      "redundancy-detection",
      {
        minOverlap: 0.5,
      },
    ],
    [
      "header-footer-detection",
      {
        ignorePages: [],
        maxMarginPercentage: 8,
      },
    ],
    "link-detection",
    "words-to-line-new",
    [
      "reading-order-detection",
      {
        minVerticalGapWidth: 5,
        minColumnWidthInPagePercent: 15,
      },
    ],
    [
      "lines-to-paragraph",
      {
        tolerance: 0.25,
      },
    ],
  ],
  output: {
    granularity: "word",
    includeMarginals: true,
    includeDrawings: false,
    formats: {
      json: true,
      text: true,
      csv: true,
      markdown: true,
      pdf: false,
      simpleJson: true,
    },
  },
};

const CHUNK_SIZE = 200;

// https://github.com/openai/openai-cookbook/blob/main/examples/Embedding_long_inputs.ipynb
// With some smarts to try split on sentances
function splitText(text: string) {
  let chunked = [];

  if (encode(text).length > CHUNK_SIZE) {
    const split = text.split("\n").filter((s) => s.length > 0);
    let chunkText = "";

    for (let i = 0; i < split.length; i++) {
      const sentence = split[i];
      const sentenceTokenLength = encode(sentence);
      const chunkTextTokenLength = encode(chunkText).length;

      if (chunkTextTokenLength + sentenceTokenLength.length > CHUNK_SIZE) {
        chunked.push(chunkText);
        chunkText = "";
      }

      if (sentence[sentence.length - 1].match(/[a-z0-9]/i)) {
        chunkText += sentence + ". ";
      } else {
        chunkText += sentence + " ";
      }
    }

    chunked.push(chunkText.trim());
  } else {
    chunked.push(text.trim());
  }

  const mappedChunks = chunked.map((text) => {
    const trimmedText = text.trim();

    const chunk = {
      content: trimmedText,
      content_length: trimmedText.length,
      content_tokens: encode(trimmedText).length,
    };

    return chunk;
  });

  if (mappedChunks.length > 1) {
    for (let i = 0; i < mappedChunks.length; i++) {
      const chunk = mappedChunks[i];
      const prevChunk = mappedChunks[i - 1];

      if (chunk.content_tokens < 100 && prevChunk) {
        prevChunk.content += " " + chunk.content;
        prevChunk.content_length += chunk.content_length;
        prevChunk.content_tokens += chunk.content_tokens;
        mappedChunks.splice(i, 1);
        i--;
      }
    }
  }

  return mappedChunks;
}

function chunkArray<T>(array: T[], chunkSize: number) {
  const chunks = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
}

export const insertOrUpdateEmbeddings = async (document: ChatDocument) => {
  const openai = OpenAIInstance();

  const split = splitText(document.textContent);

  const chunks = chunkArray(split, 20);

  const embeddings = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: chunk.map((c) => c.content),
    });

    embeddings.push(
      ...response.data.map((embedding, index) => {
        return {
          documentId: document.id,
          chunk: chunk[index].content,
          chunkLength: chunk[index].content_length,
          chunkTokens: chunk[index].content_tokens,
          embedding: embedding.embedding,
          fileName: document.name,
        };
      })
    );
  }

  await database.documentEmbedding.deleteMany({
    where: {
      documentId: document.id,
    },
  });

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

  for (const e of embeddings) {
    await database.$executeRaw`
    INSERT INTO 
    document_embedding (id, content, content_length, content_tokens, embedding, file_name, document_id) 
    VALUES (${uniqueId()}, ${e.chunk}, ${e.chunkLength}, ${e.chunkTokens}, ${
      e.embedding
    }, ${e.fileName}, ${e.documentId})
    `;
  }
};

export const UploadIndexAndSaveDocument = async (
  formData: FormData
): Promise<ServerActionResponse<string[]>> => {
  try {
    const file: File | null = formData.get("file") as unknown as File;
    if (!file || file.size > MAX_DOCUMENT_SIZE) {
      throw new Error(
        "Invalid file format or size. Only PDF files are supported."
      );
    }
    const chatThreadId = formData.get("id") as string;
    const fileName = formData.get("fileName") as string;

    console.log("CHAT THREAD ID: " + chatThreadId)

    const blob = new Blob([file], { type: file.type });
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // call parsr

    // curl -X POST \
    // http://localhost:3001/api/v1/document \
    // -H 'Content-Type: multipart/form-data' \
    // -F 'file=@/path/to/file.pdf;type=application/pdf' \
    // -F 'config=@/path/to/config.json;type=application/json'

    const formDataParsr = new FormData();
    formDataParsr.append("file", file);
    // create a file out of the parsr config
    const configBlob = new Blob([JSON.stringify(DEFAULT_PARSR_CONFIG)], {
      type: "application/json",
    });
    formDataParsr.append("config", configBlob);

    const PARSR_URL = process.env.PARSR_URL || "http://localhost:3001";
    const response = await fetch(`${PARSR_URL}/api/v1/document`, {
      method: "POST",
      body: formDataParsr,
    });

    //Status: 202 - Accepted
    // 00cafe4463b9c12aac145b3ee8f00d
    // The document you sent has been accepted and is being processed. The body contains the unique queue ID. You need to keep it somewhere for later, to know what's the queue status and get the results.

    // Status: 415 - Unsupported Media Type
    // This error means the file format you sent is not supported by the platform.

    if (response.status === 415) {
      throw new Error("Invalid file format or size for text extraction.");
    }
    const queueId = await response.text();
    console.log("QUEUEID: " + queueId);

    // 2. Get the queue status: GET /queue/{id}
    // This request allows you to get the status of the queued document being processed. You need to give it the queue ID that was return in the previous request.

    // curl command
    // curl -X GET \
    //   http://localhost:3001/api/v1/queue/00cafe4463b9c12aac145b3ee8f00d
    // Status: 200 - OK
    // {
    //   "estimated-remaining-time": 30,
    //   "progress-percentage": 10,
    //   "start-date": "2018-12-31T12:34:56.789Z",
    //   "status": "Detecting reading order..."
    // }
    // This status means the document is still being processed.

    // The estimated-remaining-time is expressed in seconds.

    // NB: estimated-remaining-time and progress-percentage are not working yet and are placeholder for future usage.

    // Status: 201 - Created
    // {
    //   "id": "00cafe4463b9c12aac145b3ee8f00d",
    //   "json": "/api/v1/json/00cafe4463b9c12aac145b3ee8f00d",
    //   "csv": "/api/v1/csv/00cafe4463b9c12aac145b3ee8f00d",
    //   "text": "/api/v1/text/00cafe4463b9c12aac145b3ee8f00d",
    //   "markdown": "/api/v1/markdown/00cafe4463b9c12aac145b3ee8f00d"
    // }
    // This status is sent when the processing is done. It returns links to the generated resources and the ID of the document for convenience.

    // Status: 404 - Not Found
    // This error means the queue ID doesn't refer to any known processing queue.

    // Status: 500 - Internal Server Error
    // This error means that something went terribly wrong on the backend, probably an error coming from Parsr.

    const sleep = (ms: number) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };

    const MAX_RETRIES = 10;
    let retries = 0;
    while (true) {
      console.log("RETRIES: " + retries);
      if (retries >= MAX_RETRIES) {
        throw new Error("Parsr is taking too long to process the document.");
      }

      const response = await fetch(`${PARSR_URL}/api/v1/queue/${queueId}`, {
        method: "GET",
        cache: "no-store",
      });
      const status = response.status;
      console.log("STATUS: " + status);

      if (status === 200) {
        const queueStatus = await response.json();
        console.log("QUEUE STATUS: " + JSON.stringify(queueStatus));
        await sleep(2000);
      } else if (status === 201) {
        // done
        break;
      } else if (status === 404) {
        throw new Error("Invalid file format or size for text extraction.");
      } else {
        throw new Error("Unknown error");
      }
      retries++;
    }

    // 3. Get the results: GET /api/v1/text/00cafe4463b9c12aac145b3ee8f00d

    const responseText = await fetch(`${PARSR_URL}/api/v1/text/${queueId}`, {
      method: "GET",
    });
    const text = await responseText.text();
    const modelToSave: ChatDocument = {
      chatThreadId: chatThreadId,
      id: uniqueId(),
      userId: await userHashedId(),
      createdAt: new Date(),
      type: CHAT_DOCUMENT_ATTRIBUTE,
      isDeleted: false,
      name: fileName,
      blob: buffer,
      textContent: text,
    };

    const data = await database.chatDocument.create({
      data: modelToSave,
    });

    await insertOrUpdateEmbeddings(data);

    return {
      success: true,
      error: "",
      response: [],
    };
  } catch (e) {
    return {
      success: false,
      error: (e as Error).message,
      response: [],
    };
  }
};

export const FindAllChatDocuments = async (chatThreadID: string) => {
  const response = await database.chatDocument.findMany({
    where: {
      chatThreadId: chatThreadID,
      isDeleted: false,
      type: CHAT_DOCUMENT_ATTRIBUTE,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return response;
};