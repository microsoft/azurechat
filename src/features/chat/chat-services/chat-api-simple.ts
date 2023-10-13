import { userHashedId } from "@/features/auth/helpers";
import { CosmosDBChatMessageHistory } from "@/features/langchain/memory/cosmosdb/cosmosdb";
import { AI_NAME } from "@/features/theme/customise";
import { LangChainStream, StreamingTextResponse } from "ai";
import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferWindowMemory } from "langchain/memory";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { initAndGuardChatSession } from "./chat-thread-service";
import { PromptGPTProps } from "./models";
import { transformConversationStyleToTemperature } from "./utils";

// AI Plugin imports
import {
  RequestsGetTool,
  RequestsPostTool,
  AIPluginTool,
} from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";

import plugin from "@tailwindcss/typography";

export const ChatAPISimple = async (props: PromptGPTProps) => {
  const { lastHumanMessage, id, chatThread } = await initAndGuardChatSession(
    props
  );

  const { stream, handlers } = LangChainStream();

  const userId = await userHashedId();

  const chat = new ChatOpenAI({
    temperature: transformConversationStyleToTemperature(
      chatThread.conversationStyle
    ),
    streaming: true,
  });

  const memory = new BufferWindowMemory({
    k: 100,
    returnMessages: true,
    memoryKey: "history",
    chatHistory: new CosmosDBChatMessageHistory({
      sessionId: id,
      userId: userId,
    }),
  });

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `-You are ${AI_NAME} who is a helpful AI Assistant.
      - You will provide clear and concise queries, and you will respond with polite and professional answers.
      - You will answer questions truthfully and accurately.`
    ),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);


  // PLUGIN DEV JASON
  const weatherPluginJson = {
    "schema_version": "v1",
    "name_for_human": "Weather Data",
    "name_for_model": "WeatherData",
    "description_for_human": "Retrieve weather data for a given location.",
    "description_for_model": "Assistant uses the Weather Data Plugin for retrieving weather data for a given location.",
    "auth": {
      "type": "none"
    },
    "api": {
      "type": "openapi",
      "url": "https://example.com/openapi.yaml"
    },
    "logo_url": "https://example.com/logo.png",
    "contact_email": "support@example.com",
    "legal_info_url": "https://example.com/legal"
  }

  const weatherApiYaml = `openapi: 3.0.1
  info:
    title: Weather Plugin
    description: A plugin that can provide weather data for a given location.
    version: "v1"
  servers:
    - url: https://echo-22222.azurewebsites.net/api
  paths:
    /weather:
      post:
        operationId: getWeather
        summary: Get the weather for the location
        requestBody:
          required: true
          content:
            application/json:
              schema:
                type: object
                required:
                  - location
                  - format
                properties:
                  location:
                    type: string
                    description: The city and state, e.g. San Francisco, CA
                  format:
                    type: string
                    description: The temperature unit to use. Infer this from the users location.
        responses:
          "200":
            description: OK
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    temperature:
                      type: number
                      description: The temperature in degrees Celsius.
                    unit:
                      type: string
                      description: The unit of the temperature.
  `
  const weatherApiJson = {
    "openapi": "3.0.1",
    "info": {
      "title": "Weather Plugin",
      "description": "A plugin that can provide weather data for a given location.",
      "version": "v1"
    },
    "servers": [
      {
        "url": "https://echo-22222.azurewebsites.net/api"
      }
    ],
    "paths": {
      "/weather": {
        "post": {
          "operationId": "getWeather",
          "summary": "Get the weather for the location",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "location",
                    "format"
                  ],
                  "properties": {
                    "location": {
                      "type": "string",
                      "description": "The city and state, e.g. San Francisco, CA"
                    },
                    "format": {
                      "type": "string",
                      "description": "The temperature unit to use. Infer this from the users location."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "OK",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "temperature": {
                        "type": "number",
                        "description": "The temperature in degrees Celsius."
                      },
                      "unit": {
                        "type": "string",
                        "description": "The unit of the temperature."
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }


  // Create an AIPluginTool
  const weatherPluginTool = new AIPluginTool({
    name: weatherPluginJson.name_for_model,
    description: `Call this tool to get the OpenAPI spec (and usage guide) for interacting with the ${weatherPluginJson.name_for_human} API. You should only call this ONCE! What is the ${weatherPluginJson.name_for_human} API useful for? ${weatherPluginJson.description_for_human}`,
    apiSpec: `Usage Guide: ${weatherPluginJson.description_for_model}

OpenAPI Spec in JSON or YAML format:\n${JSON.stringify(weatherApiJson)}`,
  });

  const shoppingPluginTool = await AIPluginTool.fromPluginUrl(
    "https://www.klarna.com/.well-known/ai-plugin.json"
  );

  // console.log("=== NEW AIPLUGIN TOOL: ", weatherPluginTool);
  // console.log("=== NEW AIPLUGIN TOOL: ", shoppingPluginTool);


  // Register the tools
  const tools = [
    new RequestsGetTool(),
    new RequestsPostTool(),
    weatherPluginTool,
    shoppingPluginTool,
  ];

  // Executor
  const agent = await initializeAgentExecutorWithOptions(
    tools,
    chat,
    {
      // agentType: "chat-zero-shot-react-description",
      agentType: "openai-functions",
      verbose: true
    }
  );

  // want to use  handleParsingErrors: true but I think we need to upgrade Langchain version

  // Call the agent
  agent.call({
    input: lastHumanMessage.content
    // input: "what t shirts are available in klarna?"
    // input: "what's the weather in Dubai?"
  }, [handlers]);




  // const chain = new ConversationChain({
  //   llm: chat,
  //   memory,
  //   prompt: chatPrompt,
  // });

  // chain.call({ input: lastHumanMessage.content }, [handlers]);

  return new StreamingTextResponse(stream);
};
