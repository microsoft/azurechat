import {
  FindAllChats,
  UpsertChat,
} from "@/features/chat/chat-services/chat-service";
import {
  ChatMessageModel,
  MESSAGE_ATTRIBUTE,
} from "@/features/chat/chat-services/models";
import { StoredMessage } from "langchain/schema";

export const getChatMessages = async (
  sessionId: string
): Promise<StoredMessage[]> => {
  const items = await FindAllChats(sessionId);
  const ms: StoredMessage[] = [];
  items.forEach((item) => {
    ms.push({
      type: MESSAGE_ATTRIBUTE,
      data: {
        content: item.content,
        role: item.role === "user" ? "human" : "ai",
        name: item.userId,
      },
    });
  });

  return ms;
};

export const addChatMessage = async (modelToSave: ChatMessageModel) => {
  return await UpsertChat(modelToSave);
};
