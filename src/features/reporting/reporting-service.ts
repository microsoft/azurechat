import {
  CHAT_THREAD_ATTRIBUTE,
  MESSAGE_ATTRIBUTE,
} from "../chat/chat-services/models";
import database from "../common/database";

export const FindAllChatThreadsForReporting = async (
  pageSize = 10,
  pageNumber = 0
) => {
  const result = await database.chatThread.findMany({
    where: {
      isDeleted: false,
      type: CHAT_THREAD_ATTRIBUTE,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: pageNumber * pageSize,
    take: pageSize,
  });
  return result;
};

export const FindChatThreadByID = async (chatThreadID: string) => {
  const result = await database.chatThread.findFirstOrThrow({
    where: {
      id: chatThreadID,
      isDeleted: false,
      type: CHAT_THREAD_ATTRIBUTE,
    },
  });
  return result;
};

export const FindAllChatsInThread = async (chatThreadID: string) => {
  const result = await database.chatMessage.findMany({
    where: {
      threadId: chatThreadID,
      isDeleted: false,
      type: MESSAGE_ATTRIBUTE,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return result;
};
