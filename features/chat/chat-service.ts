"use server";
import "server-only";

import { SqlQuerySpec } from "@azure/cosmos";
import { nanoid } from "nanoid";
import { memoryContainer } from "../common/cosmos";

export const FindAllChats = async (chatThreadID: string) => {
  const container = await memoryContainer();

  const querySpec: SqlQuerySpec = {
    query:
      "SELECT * FROM root r WHERE r.type=@type AND r.threadId = @threadId AND r.isDeleted=@isDeleted",
    parameters: [
      {
        name: "@type",
        value: "CHAT_MESSAGE",
      },
      {
        name: "@threadId",
        value: chatThreadID,
      },
      {
        name: "@isDeleted",
        value: false,
      },
    ],
  };
  const { resources } = await container.items
    .query<ChatMessageOutputModel>(querySpec)
    .fetchAll();
  return resources;
};

export const UpsertChat = async (chatModel: ChatMessageInputModel) => {
  const modelToSave: ChatMessageModel = {
    ...chatModel,
    id: nanoid(),
    createdAt: new Date(),
    type: "CHAT_MESSAGE",
    isDeleted: false,
  };

  const container = await memoryContainer();
  await container.items.upsert(modelToSave);
};

export interface ChatMessageInputModel {
  threadId: string;
  content: string;
  role: "system" | "user" | "assistant";
}

export interface ChatMessageOutputModel extends ChatMessageInputModel {
  id: string;
  createdAt: Date;
  isDeleted: boolean;
}

interface ChatMessageModel extends ChatMessageOutputModel {
  type: "CHAT_MESSAGE";
}
