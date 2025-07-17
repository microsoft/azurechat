"use server";
import "server-only";

import { CreateChatMessage } from "../chat-message-service";
import { ChatThreadModel } from "../models";
import { ChatCompletionStreamingRunner, ChatCompletionStreamParams } from "openai/resources/beta/chat/completions";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { ChatWebSearchService } from "../chat-websearch-service";
import { OpenAIInstance } from "@/features/common/services/openai";
import { AI_NAME } from "@/features/theme/theme-config";


/**
 * Runs a websearch agent, gathers the conversation history, and RAGs the result into the chat completions stream.
 */
export async function ChatApiWebSearch(props: {
  chatThread: ChatThreadModel;
  userMessage: string;
  history: ChatCompletionMessageParam[];
  signal: AbortSignal;
}): Promise<ChatCompletionStreamingRunner> {
  const { chatThread, userMessage, history, signal } = props;

  // 1. Gather the conversation history into a single string
  const historyString = history
    .map((msg) => `${msg.role}: ${typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)}`)
    .join("\n");

  console.log("\n\n====DEBUG: history for websearch:\n", historyString);

  // 2. Pass the string to the websearch agent service
  const websearchResponse = await ChatWebSearchService({
    chatThread,
    userMessage: historyString + "\n" + userMessage,
  });

  console.log("\n\n====DEBUG: Websearch response:\n", websearchResponse);

  // 3. RAG the websearch result into the chat and run the chat completions stream
  const openAI = OpenAIInstance();
  const raggedUserMessage = `\n
- Review the following web search results and create a final answer.\n
- If you don't know the answer, just say that you don't know. Don't try to make up an answer.\n
- Always include the citations using the following format [[1]](url), [[2]](url).
----------------\nwebsearch response:\n
${websearchResponse}\n
----------------\nquestion:\n
${userMessage}\n`;


  const stream: ChatCompletionStreamParams = {
    model: "",
    stream: true,
    messages: [
      {
        role: "system",
        content: chatThread.personaMessage,
      },
      ...history,
      {
        role: "user",
        content: raggedUserMessage,
      },
    ],
  };

  return openAI.beta.chat.completions.stream(stream, { signal });
}
