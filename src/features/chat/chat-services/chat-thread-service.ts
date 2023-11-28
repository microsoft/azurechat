"use server";
import "server-only";

import { userHashedId, userSession } from "@/features/auth/helpers";
import { FindAllChats } from "@/features/chat/chat-services/chat-service";
import { uniqueId } from "@/features/common/util";
import { deleteDocuments } from "./azure-cog-search/azure-cog-vector-store";
import { FindAllChatDocuments } from "./chat-document-service";
import {
  CHAT_THREAD_ATTRIBUTE,
  ChatMessageModel,
  ChatThreadModel,
  ChatType,
  ConversationStyle,
  PromptGPTProps,
} from "./models";
import database from "@/features/common/database";
import { ChatThread, ChatMessage } from "@prisma/client"

export const FindAllChatThreadForCurrentUser = async () => {
  const result = await database.chatThread.findMany({
    where: {
      userId: await userHashedId(),
      isDeleted: false,
      type: CHAT_THREAD_ATTRIBUTE,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

export const FindChatThreadByID = async (id: string) => {
  const result = await database.chatThread.findFirstOrThrow({
    where: {
      id: id,
      userId: await userHashedId(),
      isDeleted: false,
      type: CHAT_THREAD_ATTRIBUTE,
    },
  });
  return result;
  
};

export const SoftDeleteChatThreadByID = async (chatThreadID: string) => {
  const thread = await FindChatThreadByID(chatThreadID);
  const chats = await FindAllChats(chatThreadID);

  chats.forEach(async (chat) => {
    const itemToUpdate = {
      ...chat,
    };
    itemToUpdate.isDeleted = true;
    await database.chatMessage.update({
      where: {
        id: chat.id,
      },
      data: itemToUpdate,
    });
  });

  const chatDocuments = await FindAllChatDocuments(chatThreadID);

  if (chatDocuments.length !== 0) {
    await deleteDocuments(chatThreadID);
  }

  chatDocuments.forEach(async (chatDocument) => {
    const itemToUpdate = {
      ...chatDocument,
    };
    itemToUpdate.isDeleted = true;
    await database.chatDocument.update({
      where: {
        id: chatDocument.id,
      },
      data: itemToUpdate,
    });
  });

  const itemToUpdate = {
    ...thread,
  };
  itemToUpdate.isDeleted = true;
  await database.chatThread.update({
    where: {
      id: thread.id,
    },
    data: itemToUpdate,
  });
    
};

export const EnsureChatThreadIsForCurrentUser = async (
  chatThreadID: string
) => {
  const modelToSave = await FindChatThreadByID(chatThreadID);
  return modelToSave;
};

export const UpsertChatThread = async (chatThread: ChatThread) => {
  const updatedChatThread = await database.chatThread.upsert({
    where: {
      id: chatThread.id,
    },
    create: chatThread,
    update: chatThread,
  });
  return updatedChatThread;
};

export const updateChatThreadTitle = async (
  chatThread: ChatThread,
  messages: ChatMessage[],
  chatType: ChatType,
  conversationStyle: ConversationStyle,
  chatOverFileName: string,
  userMessage: string
) => {
  if (messages.length === 0) {
    const updatedChatThread = await UpsertChatThread({
      ...chatThread,
      chatType: chatType,
      chatOverFileName: chatOverFileName,
      conversationStyle: conversationStyle,
      name: userMessage.substring(0, 30),
    });

    return updatedChatThread;
  }

  return chatThread;
};

export const CreateChatThread = async () => {
  const modelToSave: ChatThread = {
    name: "new chat",
    useName: (await userSession())!.name,
    userId: await userHashedId(),
    id: uniqueId(),
    createdAt: new Date(),
    isDeleted: false,
    chatType: "simple",
    conversationStyle: "precise",
    type: CHAT_THREAD_ATTRIBUTE,
    chatOverFileName: "",
  };
  const response = await database.chatThread.create({
    data: modelToSave,
  });
  return response;
};

export const initAndGuardChatSession = async (props: PromptGPTProps) => {
  const { messages, id, chatType, conversationStyle, chatOverFileName } = props;

  //last message
  const lastHumanMessage = messages[messages.length - 1];

  const currentChatThread = await EnsureChatThreadIsForCurrentUser(id);
  const chats = await FindAllChats(id);

  const chatThread = await updateChatThreadTitle(
    currentChatThread,
    chats,
    chatType,
    conversationStyle,
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
