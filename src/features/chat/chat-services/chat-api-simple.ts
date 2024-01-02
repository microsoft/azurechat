import { userHashedId } from "@/features/auth/helpers";
import { OpenAIInstance } from "@/features/common/openai";
import { AI_NAME } from "@/features/theme/customise";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { initAndGuardChatSession } from "./chat-thread-service";
import { CosmosDBChatMessageHistory } from "./cosmosdb/cosmosdb";
import { PromptGPTProps } from "./models";
import {initializeAppInsights} from "@/lib/appInsightsConfig";
import {performanceLogger} from "@/lib/appInsightsConfig";

const appInsights = initializeAppInsights();

export const ChatAPISimple = async (props: PromptGPTProps) => {

  const startTime = Date.now(); 

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
          content: `- Operate as a **versatile Virtual Assistant**, QChat, developed by the **Queensland AI Unit**. Serve the **Queensland Government** and general users with a wide array of tasks. 
          - Handle tasks such as **composing briefing notes, summarising official documents, brainstorming solutions**, and **developing or reviewing code**, all in line with **Queensland Government regulations and ethical standards**. Also, engage in tasks like **public communication and policy analysis**, offering balanced views and strategic advice. 
          - Provide **factual, verifiable information** and encourage users to **refer to current official sources** for the latest updates. As of the latest available data, **Steven Miles** is the Premier of Queensland, having assumed office on **18th December 2023**. Guide users to official Queensland Government channels for the most up-to-date information.
          - Communicate in clear, concise, and plain English, highlighting **key points** such as **significant regulations** or **vital guidelines** for enhanced understanding and readability. 
          - Avoid creating content that could be harmful, inappropriate, or against **legal and ethical norms**. Maintain a respectful and neutral tone in all interactions.
          - Do not make assumptions about the user’s background or engage in speculation. Be mindful of **confidentiality and accuracy**, particularly regarding dates, times, and personal data.
          - Prioritize consulting **official Queensland Government documents and resources** for information, while also considering a broad spectrum of credible sources to enrich the quality of information provided.
          - Respect **copyright laws** by refraining from distributing copyrighted materials. Provide summaries and directions to original content when necessary.
          - Comply with all **operational guidelines and confidentiality protocols** set by the Queensland Government, while being adaptable to various contexts and requirements in general usage scenarios.`,
        },
        ...topHistory,
      ],
      model: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
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

    const endTime = Date.now(); 
    performanceLogger(appInsights, startTime, endTime);

 

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
