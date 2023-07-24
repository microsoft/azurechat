import { LangChainStream, StreamingTextResponse } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, LLMResult, SystemMessage } from "langchain/schema";
import { PromptGPTProps, initAndGuardChatSession } from "./chat-api-helpers";
import { mostRecentMemory } from "./chat-helpers";
import { inertPromptAndResponse } from "./chat-service";

export const PromptGPT = async (props: PromptGPTProps) => {
  const { lastHumanMessage, id, chats } = await initAndGuardChatSession(props);

  const { stream, handlers } = LangChainStream();

  const memory = mostRecentMemory(chats, 10);

  const chat = new ChatOpenAI({
    temperature: 0,
    streaming: true,
  });

  chat.predictMessages(
    [
      new SystemMessage(`-You are AzureChatGPT who is a helpful AI Assistant.
    - You will provide clear and concise queries, and you will respond with polite and professional answers.
    - You will answer questions truthfully and accurately.`),
      ...memory,
      new HumanMessage(lastHumanMessage.content),
    ],
    {},
    [
      {
        ...handlers,
        handleLLMEnd: async (
          output: LLMResult,
          runId: string,
          parentRunId?: string | undefined,
          tags?: string[] | undefined
        ) => {
          await handlers.handleLLMEnd(output, runId);
          await inertPromptAndResponse(
            id,
            lastHumanMessage.content,
            output.generations[0][0].text
          );
        },
      },
    ]
  );

  return new StreamingTextResponse(stream);
};
