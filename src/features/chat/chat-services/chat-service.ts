"use server";
import "server-only";

import { uniqueId } from "@/features/common/util";
import { SqlQuerySpec } from "@azure/cosmos";
import { CosmosDBContainer } from "../../common/cosmos";
import { ChatMessageModel, MESSAGE_ATTRIBUTE } from "./models";
import database from "@/features/common/database";

export const FindAllChats = async (chatThreadID: string) => {
  const response = await database.chatMessage.findMany({
    where: {
      threadId: chatThreadID,
      isDeleted: false,
      type: MESSAGE_ATTRIBUTE,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return response;
};

export const UpsertChat = async (chatModel: ChatMessageModel) => {
  const modelToSave: ChatMessageModel = {
    ...chatModel,
    id: uniqueId(),
    createdAt: new Date(),
    type: MESSAGE_ATTRIBUTE,
    isDeleted: false,
  };

  await database.chatMessage.create({
    data: modelToSave,
  });
};

export const insertPromptAndResponse = async (
  threadID: string,
  userQuestion: string,
  assistantResponse: string
) => {
  await UpsertChat({
    ...newChatModel(),
    content: userQuestion,
    threadId: threadID,
    role: "user",
  });
  await UpsertChat({
    ...newChatModel(),
    content: assistantResponse,
    threadId: threadID,
    role: "assistant",
  });
};

export const newChatModel = (): ChatMessageModel => {
  return {
    content: "",
    threadId: "",
    role: "user",
    userId: "",
    id: uniqueId(),
    createdAt: new Date(),
    type: MESSAGE_ATTRIBUTE,
    isDeleted: false,
    context: "",
  };
};
