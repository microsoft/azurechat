"use server";
import "server-only";

import { userHashedId, userSession } from "@/features/auth/helpers";
import { FindAllChats } from "@/features/chat/chat-services/chat-service";
import { SqlQuerySpec } from "@azure/cosmos";
import { nanoid } from "nanoid";
import { initDBContainer } from "../../common/cosmos";
import {
  CHAT_THREAD_ATTRIBUTE,
  ChatMessageModel,
  ChatThreadModel,
  PromptGPTProps,
} from "./models";

export const FindAllChatThreadForCurrentUser = async () => {
  const container = await initDBContainer();

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
    .query<ChatThreadModel>(querySpec)
    .fetchAll();
  return resources;
};

export const FindChatThreadByID = async (id: string) => {
  const container = await initDBContainer();

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

export const SoftDeleteChatThreadByID = async (chatThreadID: string) => {
  const container = await initDBContainer();

  const threads = await FindChatThreadByID(chatThreadID);

  if (threads.length !== 0) {
    const chats = await FindAllChats(chatThreadID);

    chats.forEach(async (chat) => {
      const itemToUpdate = {
        ...chat,
      };
      itemToUpdate.isDeleted = true;
      await container.items.upsert(itemToUpdate);
    });

    threads.forEach(async (thread) => {
      const itemToUpdate = {
        ...thread,
      };
      itemToUpdate.isDeleted = true;
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
  const container = await initDBContainer();
  return await container.items.upsert(chatThread);
};

export const updateChatThreadTitle = async (
  chatThread: ChatThreadModel,
  messages: ChatMessageModel[],
  modelName: string,
  userMessage: string
) => {
  if (messages.length === 0) {
    await UpsertChatThread({
      ...chatThread,
      model: modelName,
      name: userMessage.substring(0, 30),
    });
  }
};

export const CreateChatThread = async () => {
  const modelToSave: ChatThreadModel = {
    name: "new chat",
    useName: (await userSession())!.name,
    userId: await userHashedId(),
    model: "",
    id: nanoid(),
    createdAt: new Date(),
    isDeleted: false,
    chatType: "simple",
    type: CHAT_THREAD_ATTRIBUTE,
  };

  const container = await initDBContainer();
  const response = await container.items.create<ChatThreadModel>(modelToSave);
  return response.resource;
};

export const initAndGuardChatSession = async (props: PromptGPTProps) => {
  const { messages, id, model } = props;

  //last message
  const lastHumanMessage = messages[messages.length - 1];

  const chatThread = await EnsureChatThreadIsForCurrentUser(id);
  const chats = await FindAllChats(id);

  await updateChatThreadTitle(
    chatThread,
    chats,
    model,
    lastHumanMessage.content
  );

  return {
    id,
    lastHumanMessage,
    chats,
  };
};
