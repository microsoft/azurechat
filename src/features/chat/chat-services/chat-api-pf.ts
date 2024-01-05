import { userHashedId } from "@/features/auth/helpers";
import { StreamingTextResponse } from "ai";
import { initAndGuardChatSession } from "./chat-thread-service";
import { CosmosDBChatMessageHistory } from "./cosmosdb/cosmosdb";
import { PromptGPTProps, PromptflowChatMessage } from "./models";
import axios from "axios";
import { ChatCompletionMessage } from "openai/resources";

export const ChatAPIPromptFlow = async (props: PromptGPTProps) => {
  const { lastHumanMessage, chatThread } = await initAndGuardChatSession(props);
  const userId = await userHashedId();

  const chatHistory = new CosmosDBChatMessageHistory({
    sessionId: chatThread.id,
    userId: userId,
  });

  const history = await chatHistory.getMessages();
  const topHistory = history.slice(history.length - 30, history.length);

  try {
    const pfHistory = topHistory.reduce(
      (acc: PromptflowChatMessage[], message: ChatCompletionMessage) => {
        if (message.role === "user") {
          acc.push({
            inputs: {
              question: message.content || "",
            },
            outputs: {},
          });
        } else if (message.role === "assistant" && acc.length > 0) {
          acc[acc.length - 1].outputs.answer = message.content || "";
        }
        return acc;
      },
      []
    );

    const response = await axios.post(
      `${process.env.PROMPT_FLOW_API_URL}`,
      {
        question: lastHumanMessage.content,
        chat_history: pfHistory,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PROMPT_FLOW_API_KEY}`,
        },
      }
    );


    await chatHistory.addMessage({
      content: lastHumanMessage.content,
      role: "user",
    });

    await chatHistory.addMessage({
      content: response.data.answer,
      role: "assistant",
    });

    return new StreamingTextResponse(response.data.answer);
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
