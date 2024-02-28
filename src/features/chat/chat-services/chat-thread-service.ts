"use server";

import "server-only";
import { getTenantId, userHashedId, userSession } from "@/features/auth/helpers";
import { FindAllChats } from "@/features/chat/chat-services/chat-service";
import { uniqueId } from "@/features/common/util";
import { SqlQuerySpec } from "@azure/cosmos";
import { CosmosDBContainer } from "../../common/cosmos";
import { CHAT_THREAD_ATTRIBUTE, ChatMessageModel, ChatThreadModel, ChatType, ChatUtilities, ConversationSensitivity, ConversationStyle, PromptGPTProps } from "./models";

function threeMonthsAgo(): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 3);
  return date.toISOString();
}

export const FindAllChatThreadForCurrentUser = async () => {
  const container = await CosmosDBContainer.getInstance().getContainer();
  const tenantId = await getTenantId();
  const userId = await userHashedId();

  const partitionKey = [tenantId, userId];

  const querySpec: SqlQuerySpec = {
    query:
      "SELECT * FROM root r WHERE r.type=@type AND r.isDeleted=@isDeleted AND r.userId=@userId AND r.tenantId=@tenantId AND r.createdAt >= @createdAt ORDER BY r.createdAt DESC",
    parameters: [
      {
        name: "@type",
        value: CHAT_THREAD_ATTRIBUTE,
      },
      {
        name: "@isDeleted",
        value: false,
      },
      {
        name: "@userId",
        value: userId,
      },
      {
        name: "@tenantId",
        value: tenantId,
      },
      {
        name: "@createdAt",
        value: threeMonthsAgo(),
      },
    ],
  };

  try {
    const { resources } = await container.items
      .query<ChatThreadModel>(querySpec, {
        partitionKey,
      })
      .fetchAll();
    return resources;
  } catch (error) {
    console.log("Failed to fetch chat threads for current user:", error);
    throw error;
  }
};

export const FindChatThreadByID = async (id: string) => {
  const container = await CosmosDBContainer.getInstance().getContainer();
  const tenantId = await getTenantId();
  const userId = await userHashedId();

  const partitionKey = [tenantId, userId];

  const querySpec: SqlQuerySpec = {
    query:
      "SELECT * FROM root r WHERE r.id=@id AND r.type=@type AND r.isDeleted=@isDeleted AND r.userId=@userId AND r.tenantId=@tenantId AND r.createdAt >= @createdAt",
    parameters: [
      { name: "@id", value: id, },
      { name: "@type", value: CHAT_THREAD_ATTRIBUTE, },
      { name: "@isDeleted", value: false, },
      { name: "@userId", value: userId, },
      { name: "@tenantId", value: tenantId, },
      { name: "@createdAt", value: threeMonthsAgo(),  },
    ],
  };

  try {
    const { resources } = await container.items
      .query<ChatThreadModel>(querySpec, {
        partitionKey,
      })
      .fetchAll();

    return resources;
  } catch (error) {
    console.log("Failed to fetch chat thread by ID:", error);
    throw error;
  }
};


export const RenameChatThreadByID = async (
  chatThreadID: string,
  newTitle: string | Promise<string> | null
) => {
  const resolvedTitle = await Promise.resolve(newTitle);
  const container = await CosmosDBContainer.getInstance().getContainer();
  const threads = await FindChatThreadByID(chatThreadID);

  if (threads.length !== 0) {
    await Promise.all(threads.map(async (thread) => {
      const itemToUpdate = { ...thread, name: resolvedTitle };
      await container.items.upsert(itemToUpdate);
    }));
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

export const UpsertPromptButton = async (prompt: string, chatThreadId: string) => {
  const container = await CosmosDBContainer.getInstance().getContainer();
  const updatedChatPrompts = await container.items.upsert<ChatUtilities>({
    id: chatThreadId,
    chatThreadId: chatThreadId,
    userId: await userHashedId(),
    tenantId: await getTenantId(),
    promptButton: prompt,
  });
  if (updatedChatPrompts === undefined) {
    throw new Error("Prompt Button not selected");
  }
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
      chatCategory: "Uncategorised",
      chatOverFileName: chatOverFileName,
      conversationStyle: conversationStyle,
      conversationSensitivity: conversationSensitivity,
      name: "New Chat",
      previousChatName: ""
    });

    return updatedChatThread.resource!;
  }

  return chatThread;
};

export const CreateChatThread = async () => {
  const id = uniqueId();
  const modelToSave: ChatThreadModel = {
    name: "New Chat",
    previousChatName: "",
    chatCategory: "Uncategorised",
    useName: (await userSession())!.name,
    userId: await userHashedId(),
    id: id,
    chatThreadId: id,
    tenantId: await getTenantId(),
    createdAt: new Date(),
    isDeleted: false,
    isDisabled: false,
    contentSafetyWarning: "",
    chatType: ChatType.Simple,
    conversationStyle: ConversationStyle.Precise,
    conversationSensitivity: ConversationSensitivity.Official,
    type: CHAT_THREAD_ATTRIBUTE,
    chatOverFileName: "",
  };

  const container = await CosmosDBContainer.getInstance().getContainer();
  const response = await container.items.create<ChatThreadModel>(modelToSave);
  return response.resource;
};

export const initAndGuardChatSession = async (props: PromptGPTProps) => {
  const { messages, id, chatType, conversationStyle, conversationSensitivity, chatOverFileName } = props;

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

export const FindChatThreadByTitleAndEmpty = async (title: string): Promise<ChatThreadModel | undefined> => {
  const container = await CosmosDBContainer.getInstance().getContainer();

  const querySpec = {
    query:
      "SELECT * FROM root r WHERE r.type=@type AND r.userId=@userId AND r.name=@name AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.createdAt >= @createdAt ORDER BY r.createdAt DESC",
    parameters: [
      {
        name: "@type",
        value: CHAT_THREAD_ATTRIBUTE,
      },
      {
        name: "@name",
        value: title,
      },
      {
        name: "@isDeleted",
        value: false,
      },
      {
        name: "@userId",
        value: await userHashedId(),
      },
      {
        name: "@tenantId",
        value: await getTenantId(),
      },
      {
        name: "@createdAt",
        value: threeMonthsAgo(),
      },
    ],
  };

  const { resources } = await container.items.query<ChatThreadModel>(querySpec).fetchAll();

  for (const chatThread of resources) {
    const messages = await FindAllChats(chatThread.id);

    if (messages.length === 0) {
      return chatThread;
    }
  }

  return undefined;
};


export const UpdateChatThreadCreatedAt = async (threadId: string) => {
  const container = await CosmosDBContainer.getInstance().getContainer();
  const threads = await FindChatThreadByID(threadId);

  if (threads.length !== 0) {
    const threadToUpdate = threads[0];
    threadToUpdate.createdAt = new Date();

    await container.items.upsert(threadToUpdate);
    return threadToUpdate; 
  } else {
    throw new Error("Chat thread not found");
  }
};

export const AssociateOffenderWithChatThread = async (chatThreadId: string, offenderId: string | undefined) => {
  const container = await CosmosDBContainer.getInstance().getContainer();
  const threads = await FindChatThreadByID(chatThreadId);
  if (threads.length === 0) {
    throw new Error("Chat thread not found");
  }
  const threadToUpdate = threads[0];
  threadToUpdate.offenderId = offenderId;
  const updatedThread = await container.items.upsert<ChatThreadModel>(threadToUpdate);
  if (!updatedThread) {
    throw new Error("Failed to associate offender with chat thread");
  }
  return updatedThread.resource;
};
