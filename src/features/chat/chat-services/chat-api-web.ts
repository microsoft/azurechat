import { userHashedId } from "@/features/auth/helpers";
import { OpenAIInstance } from "@/features/common/openai";
import { AI_NAME } from "@/features/theme/customise";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { initAndGuardChatSession } from "./chat-thread-service";
import { CosmosDBChatMessageHistory } from "./cosmosdb/cosmosdb";
import { BingSearchResult } from "./Azure-bing-search/bing";
import { PromptGPTProps } from "./models";

export const ChatAPIWeb = async (props: PromptGPTProps) => {
  var snippet = "";
  var Prompt = "";
  var BingResult = "";
  const { lastHumanMessage, chatThread } = await initAndGuardChatSession(props);

  const openAI = OpenAIInstance();

  const userId = await userHashedId();

  const bing = new BingSearchResult();
  const searchResult = await bing.SearchWeb(lastHumanMessage.content);

  snippet = searchResult.webPages.value[0].snippet;
  snippet += searchResult.webPages.value[1].snippet;
  snippet += searchResult.webPages.value[2].snippet;
  snippet += searchResult.webPages.value[3].snippet;
  snippet += searchResult.webPages.value[4].snippet; 

  BingResult = + searchResult.webPages.value[0].name + "\n" + searchResult.webPages.value[0].snippet + "\n";
  BingResult += + searchResult.webPages.value[1].name + "\n" + searchResult.webPages.value[1].snippet + "\n";
  BingResult += + searchResult.webPages.value[2].name + "\n" + searchResult.webPages.value[2].snippet + "\n";
  BingResult += + searchResult.webPages.value[3].name + "\n" + searchResult.webPages.value[3].snippet + "\n";
  BingResult += + searchResult.webPages.value[4].name + "\n" + searchResult.webPages.value[4].snippet + "\n";

  Prompt = "次の{問い合わせ}について、{Web検索結果}を元に1000文字程度で回答を生成してください。" ;
  Prompt += "【問い合わせ】 "  + lastHumanMessage.content ;
  Prompt += "【Web検索結果】" + snippet; 

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
  //var topHistory = "[ { role: 'user', content: '" + Prompt + "' } ]";
  //console.log(topHistory);

  try {
    const response = await openAI.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `あなたは ${AI_NAME} です。ユーザーからの質問に対して日本語で丁寧に回答します。
          - 質問には正直かつ正確に答えます。`,
        },
        {
          role: "user",
          content: Prompt,
        }
        //...topHistory,
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
