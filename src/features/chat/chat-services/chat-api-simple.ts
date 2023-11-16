import { userHashedId } from "@/features/auth/helpers";
import { OpenAIInstance } from "@/features/common/openai";
import { AI_NAME } from "@/features/theme/customise";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { initAndGuardChatSession } from "./chat-thread-service";
import { CosmosDBChatMessageHistory } from "./cosmosdb/cosmosdb";
import { PromptGPTProps } from "./models";

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
    const response = await openAI.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `-You are ${AI_NAME} who is a helpful AI Assistant.
          - You will provide clear and concise queries, and you will respond with polite and professional answers.
          - You will answer questions truthfully and accurately.`,
        },
        ...topHistory,
      ],
      model: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
      top_p: Number.parseFloat(
        process.env.OPENAI_API_TOP_P ?? "1"
      ),
      frequency_penalty: Number.parseFloat(
        process.env.OPENAI_API_FREQUENCY_PENALTY ?? "0"
      ),
      presence_penalty: Number.parseFloat(
        process.env.OPENAI_API_PRESENCE_PENALTY ?? "0"
      ),
      max_tokens: Number.parseFloat(
        process.env.OPENAI_API_MAX_TOKENS ?? Number.POSITIVE_INFINITY.toString()
      ),
      stream: true,
    });

    const stream = OpenAIStream(response, {
      async onCompletion(completion) {
        await chatHistory.addMessage({
          content: completion,
          role: "assistant",
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
