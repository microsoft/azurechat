"use server";
import "server-only";

import { uniqueId } from "@/features/common/util";
import { SqlQuerySpec } from "@azure/cosmos";
import { CosmosDBContainer } from "../../common/cosmos";
import { ChatMessageModel, MESSAGE_ATTRIBUTE, ChatSentiment, ChatRole } from "./models";
import { getTenantId, userHashedId } from "@/features/auth/helpers";


export const FindAllChats = async (threadID: string) => {
  const container = await CosmosDBContainer.getInstance().getContainer();

  const querySpec: SqlQuerySpec = {
    query: "SELECT * FROM root r WHERE r.type=@type AND r.threadId=@threadId AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.userId=@userId",
    parameters: [
      { name: "@type", value: MESSAGE_ATTRIBUTE },
      { name: "@threadId", value: threadID },
      { name: "@isDeleted", value: false },
      { name: "@userId", value: await userHashedId(),},
      { name: "@tenantId", value: await getTenantId(), },
    ],
  };

  const { resources } = await container.items
    .query<ChatMessageModel>(querySpec)
    .fetchAll();

  return resources;
};

export const FindChatMessageByID = async (id: string, threadID: string) => {
  const container = await CosmosDBContainer.getInstance().getContainer();

  const querySpec: SqlQuerySpec = {
    query: "SELECT * FROM root r WHERE r.type=@type AND r.threadId=@threadId AND r.id=@id AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.userId=@userId",
    parameters: [
      { name: "@type", value: MESSAGE_ATTRIBUTE },
      { name: "@threadId", value: threadID },
      { name: "@id", value: id },
      { name: "@isDeleted", value: false },
      { name: "@userId", value: await userHashedId() },
      { name: "@tenantId", value: await getTenantId() },
    ],
  };

  const { resources } = await container.items
    .query<ChatMessageModel>(querySpec)
    .fetchAll();

  return resources;
};

export const CreateUserFeedbackChatId = async (
  chatMessageId: string,
  feedback: string,
  sentiment: ChatSentiment,
  reason: string,
  threadID: string
) => {
  try {
    const container = await CosmosDBContainer.getInstance().getContainer();
    const chatMessageModel = await FindChatMessageByID(chatMessageId, threadID);

    if (chatMessageModel.length !== 0) {
      const message = chatMessageModel[0];
      message.feedback = feedback;
      message.sentiment = sentiment;
      message.reason = reason;

      const itemToUpdate = { ...message };
      await container.items.upsert(itemToUpdate);
      return itemToUpdate;
    }
  } catch (e) {
    console.log("There was an error in saving user feedback", e);
  }
};

export const UpsertChat = async (chatModel: ChatMessageModel, userId: string, tenantId: string) => {
  const modelToSave: ChatMessageModel = {
    ...chatModel,
    id: uniqueId(),
    createdAt: new Date(),
    type: MESSAGE_ATTRIBUTE,
    isDeleted: false,
    userId: userId,
    tenantId: tenantId,
  };
  
  const container = await CosmosDBContainer.getInstance().getContainer();
  if (container) {
    await container.items.upsert(modelToSave);
  }
};

export const insertPromptAndResponse = async (
  threadID: string,
  userQuestion: string,
  assistantResponse: string,
  userId: string,
  tenantId: string
) => {
  await UpsertChat({
    ...newChatModel(userId, tenantId),
    content: userQuestion,
    threadId: threadID,
    role: ChatRole.User,
  }, userId, tenantId);
  await UpsertChat({
    ...newChatModel(userId, tenantId),
    content: assistantResponse,
    threadId: threadID,
    role: ChatRole.Assistant,
  }, userId, tenantId);
};

export const newChatModel = (userId: string, tenantId: string): ChatMessageModel => { // Added parameters
  return {
    content: "",
    threadId: "",
    role: ChatRole.User,
    tenantId: tenantId,
    userId: userId,
    id: uniqueId(),
    createdAt: new Date(),
    type: MESSAGE_ATTRIBUTE,
    isDeleted: false,
    context: "",
    systemPrompt: process.env.SYSTEM_PROMPT || `-You are Qchat who is a helpful AI Assistant developed to assist Queensland government employees in their day-to-day tasks.
    - You will provide clear and concise queries, and you will respond with polite and professional answers.
    - You will answer questions truthfully and accurately.
    - You will respond to questions in accordance with rules of Queensland government.`,
    feedback: "",
    sentiment: ChatSentiment.Neutral,
    reason: "",
    contextPrompt: "",
    contentSafetyWarning: "",
  };
};

function gethashedId(userId: string): string | void | PromiseLike<string | void | undefined> | undefined {
  throw new Error("Function not implemented.");
}
