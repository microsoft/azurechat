import { getTenantId, userHashedId } from "@/features/auth/helpers";
import { OpenAIInstance } from "@/features/common/openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { initAndGuardChatSession } from "./chat-thread-service";
import { CosmosDBChatMessageHistory } from "./cosmosdb/cosmosdb";
import { PromptGPTProps } from "./models";
import { chatCatName } from "./chat-utility";
import { translator } from "./chat-translator-service";

export const ChatAPISimple = async (props: PromptGPTProps) => {
  const { lastHumanMessage, chatThread } = await initAndGuardChatSession(props);
  const openAI = OpenAIInstance();
  const userId = await userHashedId();
  const tenantId = await getTenantId();
  const chatHistory = new CosmosDBChatMessageHistory({
    sessionId: chatThread.id,
    userId: userId,
    tenantId: tenantId
  });

  await chatHistory.addMessage({
    content: lastHumanMessage.content,
    role: "user",
  });

  const history = await chatHistory.getMessages();
  const topHistory = history.slice(history.length - 30, history.length);

  const systemPrompt: string = process.env.SYSTEM_PROMPT || `-You are QChat who is a helpful AI Assistant developed to assist Queensland government employees in their day-to-day tasks. 
   - You will provide clear and concise queries, and you will respond with polite and professional answers.
   - You will answer questions truthfully and accurately.
   - You will respond to questions in accordance with rules of Queensland government.`;

  try {

    const response = await openAI.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
         },
        ...topHistory,
      ],
      model: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
      stream: true,
    });

    // const stream = OpenAIStream(response, {
    //   async onCompletion(completion) {
    //     try {
    //       const translatedCompletion = await translator(completion);
    //       await chatHistory.addMessage({
    //         content: translatedCompletion,
    //         role: "assistant",
    //       });
    //       await chatCatName(chatThread, lastHumanMessage.content);
    //     } catch (e) {
    //       console.log(e)
    //     }
    //   }
    // });

    const stream = OpenAIStream(response, {
      onCompletion(completion) {
        try {
          chatHistory.addMessage({
            content: completion,
            role: "assistant",
          });
          chatCatName(chatThread, lastHumanMessage.content);
        } catch (e) {
          console.log(e)
        }
      }
    });

    return new StreamingTextResponse(stream, {
      headers: {"Content-Type": "text/event-stream"},
    });
    } catch (e: unknown) {
    const customErrorName = "ChatAPIError";
    console.log(e)

    const errorResponse = e instanceof Error ? e.message : "An unknown error occurred.";
    const errorStatusText = e instanceof Error ? e.toString() : "Unknown Error";

    return new Response(errorResponse, {
      status: 500,
      statusText: errorStatusText,
    });
  }
};
