import { LangChainStream, StreamingTextResponse } from "ai";
import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { userHashedId } from "../auth/helpers";
import { CosmosDBChatMessageHistory } from "../langchain/stores/cosmosdb";
import { PromptGPTProps, initAndGuardChatSession } from "./chat-api-helpers";

export const PromptGPT = async (props: PromptGPTProps) => {
  const { lastHumanMessage, id } = await initAndGuardChatSession(props);

  const { stream, handlers } = LangChainStream();

  const userId = await userHashedId();

  const chat = new ChatOpenAI({
    temperature: 0,
    streaming: true,
  });

  const memory = new BufferMemory({
    chatHistory: new CosmosDBChatMessageHistory({
      sessionId: id,
      userId: userId,
      config: {
        db: process.env.AZURE_COSMOSEDBDB_DB_NAME,
        container: process.env.AZURE_COSMOSEDBDB_CONTAINER_NAME,
        endpoint: process.env.AZURE_COSMOSEDB_URI,
        key: process.env.AZURE_COSMOSEDB_KEY,
        partitionKey: "id",
      },
    }),
  });

  const chain = new ConversationChain({
    llm: chat,
    memory,
    prompt: defineSystemPrompt(),
  });

  chain.call({ input: lastHumanMessage.content }, [handlers]);

  return new StreamingTextResponse(stream);
};

const defineSystemPrompt = () => {
  const system_combine_template = `-You are Azure ChatGPT who is a helpful AI Assistant.
     - You will provide clear and concise queries, and you will respond with polite and professional answers.
     - You will answer questions truthfully and accurately.`;
  const combine_messages = [
    SystemMessagePromptTemplate.fromTemplate(system_combine_template),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ];

  const CHAT_COMBINE_PROMPT =
    ChatPromptTemplate.fromPromptMessages(combine_messages);

  return CHAT_COMBINE_PROMPT;
};
