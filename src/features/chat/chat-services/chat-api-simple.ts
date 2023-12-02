import { userHashedId } from "@/features/auth/helpers";
import { OpenAIInstance } from "@/features/common/openai";
import { AI_NAME } from "@/features/theme/customise";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { initAndGuardChatSession } from "./chat-thread-service";
import { CosmosDBChatMessageHistory } from "./cosmosdb/cosmosdb";
import { PromptGPTProps } from "./models";
import { getTokenCount } from "./lexical/token-counter";
import database from "@/features/common/database";

export const ChatAPISimple = async (props: PromptGPTProps) => {
  const { lastHumanMessage, chatThread } = await initAndGuardChatSession(props);

  const openAI = OpenAIInstance();

  const userId = await userHashedId();

  const chatHistory = new CosmosDBChatMessageHistory({
    sessionId: chatThread.id,
    userId: userId,
  });

  await chatHistory.addMessage({
    content: lastHumanMessage.content,
    role: "user",
  });

  const history = await chatHistory.getMessages();
  const topHistory = history.slice(history.length - 30, history.length);

  try {
    const msg = {
      role: "system" as const,
      content: `-You are ${AI_NAME} who is a helpful AI Assistant.
      - You will provide clear and concise queries, and you will respond with polite and professional answers.
      - You will answer questions truthfully and accurately.`,
    };
    const messages = [msg, ...topHistory];
    const response = await openAI.chat.completions.create({
      messages: messages,
      model: props.model,
      stream: true,
    });

    const inputText = messages.map((m) => m.content).join("");

    const stream = OpenAIStream(response, {
      async onCompletion(completion) {
        await chatHistory.addMessage({
          content: completion,
          role: "assistant",
        });

        const inputTokens = getTokenCount("openai", "gpt-3.5-turbo", inputText);
        const outputTokens = getTokenCount(
          "openai",
          "gpt-3.5-turbo",
          completion
        );

        await database.messageAudit.create({
          data: {
            userId: userId,
            threadId: chatThread.id,
            promptTokens: inputTokens,
            responseTokens: outputTokens,
            promptMessage: inputText,
            responseMessage: completion,
            model: "gpt-3.5-turbo",
            provider: "openai",
          },
        });
      },
    });
    return new StreamingTextResponse(stream);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return new Response(e.message, {
        status: 500,
        statusText: e.toString(),
      });
    } else {
      return new Response("An unknown error occurred.", {
        status: 500,
        statusText: "Unknown Error",
      });
    }
  }
};
