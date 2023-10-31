import { userHashedId } from "@/features/auth/helpers";
import { OpenAIInstance } from "@/features/common/openai";
import { CosmosDBChatMessageHistory } from "@/features/langchain/memory/cosmosdb/cosmosdb";
import { similaritySearchVectorWithScore } from "@/features/langchain/vector-stores/azure-cog-search/azure-cog-vector-store";
import { AI_NAME } from "@/features/theme/customise";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { initAndGuardChatSession } from "./chat-thread-service";
import { PromptGPTProps } from "./models";

export const ChatAPIData = async (props: PromptGPTProps) => {
  const { lastHumanMessage, id, chatThread } = await initAndGuardChatSession(
    props
  );

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

  const relevantDocuments = await findRelevantDocuments(
    lastHumanMessage.content,
    id
  );

  const context = relevantDocuments
    .map(
      (result, index) =>
        `Document content: ${result.pageContent.replace(
          /(\r\n|\n|\r)/gm,
          ""
        )}\n Reference: [${encodeURIComponent(
          result.metadata
        )}] (https://YOUR_FILE_LOCATION.com/${encodeURIComponent(
          result.metadata
        )})`
    )
    .join("\n\n");

  try {
    const response = await openAI.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `-You are ${AI_NAME} who is a helpful AI Assistant.
- Given the following extracted parts of a long document, create a final answer. 
- If you don't know the answer, just say that you don't know. Don't try to make up an answer.
- In your answer, you must always include a *reference* section at the bottom. 
- You must always include *reference* from the context you are using, add its link to the reference e.g. 1. [Document name](https://YOUR_FILE_LOCATION.com/)
- You must always return markdown formatted response.
----------------
context:
${context}`,
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

const findRelevantDocuments = async (query: string, chatThreadId: string) => {
  const relevantDocuments = await similaritySearchVectorWithScore(query, 10, {
    filter: `user eq '${await userHashedId()}' and chatThreadId eq '${chatThreadId}'`,
  });

  return relevantDocuments;
};
