"use server";
import "server-only";
import { OpenAIInstance } from "@/features/common/openai";
import { userHashedId, userSession } from "@/features/auth/helpers";
import { FindAllChats } from "@/features/chat/chat-services/chat-service";
import { uniqueId } from "@/features/common/util";
import { SqlQuerySpec } from "@azure/cosmos";
import { CosmosDBContainer } from "../../common/cosmos";
import { deleteDocuments } from "./azure-cog-search/azure-cog-vector-store";
import { FindAllChatDocuments } from "./chat-document-service";
import {
  CHAT_THREAD_ATTRIBUTE,
  ChatMessageModel,
  ChatThreadModel,
  ChatType,
  ConversationSensitivity,
  ConversationStyle,
  PromptGPTProps,
} from "./models";

export const FindAllChatThreadForCurrentUser = async () => {
  const container = await CosmosDBContainer.getInstance().getContainer();

  const querySpec: SqlQuerySpec = {
    query:
      "SELECT * FROM root r WHERE r.type=@type AND r.userId=@userId AND r.isDeleted=@isDeleted ORDER BY r.createdAt DESC",
    parameters: [
      {
        name: "@type",
        value: CHAT_THREAD_ATTRIBUTE,
      },
      {
        name: "@userId",
        value: await userHashedId(),
      },
      {
        name: "@isDeleted",
        value: false,
      },
    ],
  };

  const { resources } = await container.items
    .query<ChatThreadModel>(querySpec, {
      partitionKey: await userHashedId(),
    })
    .fetchAll();
  return resources;
};

export const FindChatThreadByID = async (id: string) => {
  const container = await CosmosDBContainer.getInstance().getContainer();

  const querySpec: SqlQuerySpec = {
    query:
      "SELECT * FROM root r WHERE r.type=@type AND r.userId=@userId AND r.id=@id AND r.isDeleted=@isDeleted",
    parameters: [
      {
        name: "@type",
        value: CHAT_THREAD_ATTRIBUTE,
      },
      {
        name: "@userId",
        value: await userHashedId(),
      },
      {
        name: "@id",
        value: id,
      },
      {
        name: "@isDeleted",
        value: false,
      },
    ],
  };

  const { resources } = await container.items
    .query<ChatThreadModel>(querySpec)
    .fetchAll();

  return resources;
};

export const RenameChatThreadByID = async (
  chatThreadID: string, 
  newTitle: string| Promise<string> | null
  ) => {
  const container = await CosmosDBContainer.getInstance().getContainer();
  const threads = await FindChatThreadByID(chatThreadID);

  if (threads.length !== 0) {
    threads.forEach(async (thread) => {
      const itemToUpdate = {
        ...thread,
        name: newTitle, // Update the name property with the new title.
      };
      await container.items.upsert(itemToUpdate);
    });
  }
};

export const EnsureChatThreadIsForCurrentUser = async (
  chatThreadID: string
) => {
  const modelToSave = await FindChatThreadByID(chatThreadID);
  if (modelToSave.length === 0) {
    throw new Error("Chat thread not found");
  }

  return modelToSave[0];
};

export const UpsertChatThread = async (chatThread: ChatThreadModel) => {
  const container = await CosmosDBContainer.getInstance().getContainer();
  const updatedChatThread = await container.items.upsert<ChatThreadModel>(
    chatThread
  );

  if (updatedChatThread === undefined) {
    throw new Error("Chat thread not found");
  }

  return updatedChatThread;
};

export const updateChatThreadTitle = async (
  chatThread: ChatThreadModel,
  messages: ChatMessageModel[],
  chatType: ChatType,
  conversationStyle: ConversationStyle,
  conversationSensitivity: ConversationSensitivity,
  chatOverFileName: string,
  userMessage: string
) => {
  if (messages.length === 0) {
    const updatedChatThread = await UpsertChatThread({
      ...chatThread,
      chatType: chatType,
      chatCategory: await (generateChatCategory(userMessage)),
      chatOverFileName: chatOverFileName,
      conversationStyle: conversationStyle,
      conversationSensitivity: conversationSensitivity,
      name : await generateChatName(userMessage),
      previousChatName : await StoreOriginalChatName(chatThread.name)
    });

    return updatedChatThread.resource!;
  }

  async function StoreOriginalChatName(currentChatName: string) {
    let previousChatName: string = "";
    if (currentChatName !== previousChatName) {
        previousChatName = currentChatName; // store the original chat name
      }
      return previousChatName;
    }

  async function generateChatName(chatMessage: string): Promise <string> 
  
  {
    const openAI = OpenAIInstance();
    
    try {
      const name = await openAI.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `- create a succinct title, limited to five words and 20 characters, for the following chat """ ${chatMessage}""" conversation with a generative AI assistant:
            - this title should effectively summarise the main topic or theme of the chat.
            -  it will be used in the app's navigation interface, so it should be easily undestandable and reflective of the chat's content 
            to help users quickly grasp what the conversation was about.`
          },
        ],
        model: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
      });
      
      if (name.choices && name.choices[0] && name.choices[0].message && name.choices[0].message.content ){
        return name.choices[0].message.content;
      } else{
        console.error('Error: Unexpected response structurefrom openAI API.');
        return "";
      }
  
    } catch (e) {
      console.error(`An error occurred: ${e}`);
      const words: string[] = chatMessage.split(' ');
      const name: string = 'New Chat by Error';
      return name;
    }
    }
    
  
  async function generateChatCategory(chatMessage: string): Promise <string> {
    const openAI = OpenAIInstance();
  
    let categories = [
      'Information Processing and Management',
      'Communication and Interaction',
      'Decision Support and Advisory',
      'Educational and Training Services',
      'Operational Efficiency and Automation',
      'Public Engagement and Services',
      'Innovation and Development',
      'Creative Assistance',
      'Lifestyle and Personal Productivity',
      'Entertainment and Engagement',
      'Emotional and Mental Support'
  ];
    
    try {
      const category = await openAI.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `Categorise this chat session inside double quotes "" ${chatMessage} "" into one of the following 
            categories: ${categories.join(', ')} inside square brackets based on my query`
          },
        ],
        model: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
      });
  
  
      if (category.choices[0].message.content != null) {
        return category.choices[0].message.content;
      }
      else{
        console.log(`Uncategorised chat.`);
        return "Uncategorised!";
      }
  
      
  
    } catch (e) {
      console.error(`An error occurred: ${e}`);
      const words: string[] = chatMessage.split(' ');
      const category: string = 'Uncategorised chat';
      return category;
    }
    }

  return chatThread;
};

export const CreateChatThread = async () => {
  const modelToSave: ChatThreadModel = {
    name: "New Chat",
    previousChatName : "",
    chatCategory: "Uncategorised",
    useName: (await userSession())!.name,
    userId: await userHashedId(),
    id: uniqueId(),
    createdAt: new Date(),
    isDeleted: false,
    chatType: "simple",
    conversationStyle: "precise",
    conversationSensitivity: "official",
    type: CHAT_THREAD_ATTRIBUTE,
    chatOverFileName: "",
  };

  const container = await CosmosDBContainer.getInstance().getContainer();
  const response = await container.items.create<ChatThreadModel>(modelToSave);
  return response.resource;
};

export const initAndGuardChatSession = async (props: PromptGPTProps) => {
  const { messages, id, chatType, conversationStyle, conversationSensitivity, chatOverFileName } = props;

  //last message
  const lastHumanMessage = messages[messages.length - 1];

  const currentChatThread = await EnsureChatThreadIsForCurrentUser(id);
  const chats = await FindAllChats(id);

  const chatThread = await updateChatThreadTitle(
    currentChatThread,
    chats,
    chatType,
    conversationStyle,
    conversationSensitivity,
    chatOverFileName,
    lastHumanMessage.content
  );

  return {
    id,
    lastHumanMessage,
    chats,
    chatThread,
  };
};
