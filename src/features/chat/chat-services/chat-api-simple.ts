import { userHashedId } from "@/features/auth/helpers";
import { OpenAIInstance } from "@/features/common/openai";
import { AI_NAME } from "@/features/theme/customise";
import type { OpenAI as OpenAIClient } from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { createOpenAPIChain } from "langchain/chains";
import { initAndGuardChatSession } from "./chat-thread-service";
import { CosmosDBChatMessageHistory } from "./cosmosdb/cosmosdb";
import { PromptGPTProps } from "./models";
import { GPTPlugin, getPlugins } from "@/lib/plugins";
import { BaseCallbackHandler } from "langchain/callbacks";
import { AIMessage, ChatGeneration } from "langchain/schema";
import { ChatCompletionMessageParam } from "openai/resources";




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

  // PLUGINS CODE HERE
  // const messages = props.messages as ChatCompletionMessageParam[];
  const plugins: GPTPlugin[] = await getPlugins();
  const pluginsAsFns: OpenAIClient.Chat.Completions.ChatCompletionCreateParams.Function[] = [];

  // Iterate over all the plugins and store in the functions object
  plugins.forEach(async (plugin) => {

    // Check the length of the description, and truncate if necessary
    const FN_DESC_MAX_CHARS = 1024; // Limit enforced by ChatCompletions API
    let pluginDesc;
    if (plugin.aiPlugin.description_for_model.length > FN_DESC_MAX_CHARS) {
      console.log(`=== WARNING: Description for Plugin "${plugin.aiPlugin.name_for_model}" is too long, truncating to ${FN_DESC_MAX_CHARS} chars`);
    } else {
      pluginDesc = plugin.aiPlugin.description_for_model;
    }

    const newFunc: OpenAIClient.Chat.Completions.ChatCompletionCreateParams.Function = {
      name: plugin.aiPlugin.name_for_model,
      description: pluginDesc,
      parameters: { "type": "object", "properties": {} },
    };
    pluginsAsFns.push(newFunc);
  });

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
      stream: true,
      functions: pluginsAsFns.length > 0 ? pluginsAsFns : undefined,
    });

    const stream = OpenAIStream(response, {
      experimental_onFunctionCall: async (
        { name, arguments: args },
        createFunctionCallMessages,
      ) => {
        // NEXTJS: if you skip the function call and return nothing, the `function_call`
        // message will be sent to the client for it to handle

        console.log("\n=== GPT CALLED PLUGIN:", name, args);

        // Check the plugins to ensure that the function exists
        const plugin = plugins.find((p) => p.aiPlugin.name_for_model === name);
        if (!plugin) {
          throw new Error(`Plugin ${name} not found`);
        }

        console.log("=== PLUGIN FOUND", plugin.aiPlugin.name_for_model);

        /**
         * Use Langchain Functions + OpenAPI chain to call the API
         */
        // Define a callback handler on the LLM so we can capture the function call it wants to make
        // and show it to the user
        const handlers = BaseCallbackHandler.fromMethods({
          handleLLMEnd(outputs) {
            const llmGenerations = outputs.generations as ChatGeneration[][];
            const llmMessage = llmGenerations[0][0].message as AIMessage;
            console.log("=== GPT FUNCTION CALL: ", llmMessage.additional_kwargs.function_call);
          }
        });

        const chatModel = new ChatOpenAI({ temperature: 0, callbacks: [handlers] });

        // TODO: pass full chat history to the chain
        const chain = await createOpenAPIChain(plugin.openApiSpec, {
          llm: chatModel,
          // verbose: true,
        });

        const lastMessage = topHistory[topHistory.length - 1].content;
        console.log("=== INPUT MESSAGE: ", lastMessage);
        // OpenAPI chain will return the JSON result from the API call
        const apiResult = await chain.run(lastMessage);

        console.log("=== API RESPONSE: ", apiResult, "\n\n")

        // `createFunctionCallMessages` constructs the relevant "assistant" and "function" messages for you
        const newMessages = createFunctionCallMessages(apiResult) as ChatCompletionMessageParam[];
        return openAI.chat.completions.create({
          messages: [...topHistory, ...newMessages],
          stream: true,
          model: 'gpt-4',
          // allow recursive function calls (at the Plugin level)
          functions: pluginsAsFns,
        });
      },
    });

    // return normally
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