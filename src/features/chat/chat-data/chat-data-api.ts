import { LangChainStream, StreamingTextResponse } from "ai";
import { loadQAMapReduceChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferMemory } from "langchain/memory";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import {
  AzureCogDocument,
  AzureCogSearch,
} from "../../langchain/vector-stores/azure-cog-search/azure-cog-vector-store";
import { insertPromptAndResponse } from "../chat-services/chat-service";
import { initAndGuardChatSession } from "../chat-services/chat-thread-service";
import { ChatMessageModel, PromptGPTProps } from "../chat-services/models";

export interface FaqDocumentIndex extends AzureCogDocument {
  id: string;
  user: string;
  embedding?: number[];
  pageContent: string;
  metadata: any;
}

export const ChatData = async (props: PromptGPTProps) => {
  const { lastHumanMessage, id, chats } = await initAndGuardChatSession(props);

  const chatModel = new ChatOpenAI({
    temperature: 0,
    streaming: true,
  });

  const relevantDocuments = await findRelevantDocuments(
    lastHumanMessage.content
  );

  const chain = loadQAMapReduceChain(chatModel, {
    combinePrompt: defineSystemPrompt(),
  });
  const { stream, handlers } = LangChainStream({
    onCompletion: async (completion: string) => {
      await insertPromptAndResponse(id, lastHumanMessage.content, completion);
    },
  });

  const memory = buildMemory(chats);

  chain.call(
    {
      input_documents: relevantDocuments,
      question: lastHumanMessage.content,
      memory: memory,
    },
    [handlers]
  );

  return new StreamingTextResponse(stream);
};

const findRelevantDocuments = async (query: string) => {
  const vectorStore = initVectorStore();

  const relevantDocuments = await vectorStore.similaritySearch(query, 10, {
    vectorFields: vectorStore.config.vectorFieldName,
  });

  return relevantDocuments;
};

const defineSystemPrompt = () => {
  const system_combine_template = `Given the following extracted parts of a long document and a question, create a final answer. 
  If you don't know the answer, politely decline to answer the question. Don't try to make up an answer.
  ----------------
  {summaries}`;
  const combine_messages = [
    SystemMessagePromptTemplate.fromTemplate(system_combine_template),
    HumanMessagePromptTemplate.fromTemplate("{question}"),
  ];
  const CHAT_COMBINE_PROMPT =
    ChatPromptTemplate.fromPromptMessages(combine_messages);

  return CHAT_COMBINE_PROMPT;
};

const buildMemory = (chats: ChatMessageModel[]) => {
  const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: "history",
  });

  chats.forEach((chat) => {
    if (chat.role === "user") {
      memory.chatHistory.addUserMessage(chat.content);
    } else {
      memory.chatHistory.addAIChatMessage(chat.content);
    }
  });

  return memory;
};

const initVectorStore = () => {
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
