"use server";
import "server-only";

import { userHashedId } from "@/features/auth-page/helpers";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { uniqueId } from "@/features/common/util";
import { SqlQuerySpec } from "@azure/cosmos";
import { HistoryContainer } from "../../common/services/cosmos";
import { ChatMessageModel, ChatRole, MESSAGE_ATTRIBUTE } from "./models";

export const FindTopChatMessagesForCurrentUser = async (
  chatThreadID: string,
  top: number = 30
): Promise<ServerActionResponse<Array<ChatMessageModel>>> => {
  try {
    const querySpec: SqlQuerySpec = {
      query:
        "SELECT TOP @top * FROM root r WHERE r.type=@type AND r.threadId = @threadId AND r.userId=@userId AND r.isDeleted=@isDeleted ORDER BY r.createdAt DESC",
      parameters: [
        {
          name: "@type",
          value: MESSAGE_ATTRIBUTE,
        },
        {
          name: "@threadId",
          value: chatThreadID,
        },
        {
          name: "@userId",
          value: await userHashedId(),
        },
        {
          name: "@isDeleted",
          value: false,
        },
        {
          name: "@top",
          value: top,
        },
      ],
    };

    const { resources } = await HistoryContainer()
      .items.query<ChatMessageModel>(querySpec)
      .fetchAll();

    return {
      status: "OK",
      response: resources,
    };
  } catch (e) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `${e}`,
        },
      ],
    };
  }
};

export const FindAllChatMessagesForCurrentUser = async (
  chatThreadID: string
): Promise<ServerActionResponse<Array<ChatMessageModel>>> => {
  try {
    const querySpec: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.type=@type AND r.threadId = @threadId AND r.userId=@userId AND  r.isDeleted=@isDeleted ORDER BY r.createdAt ASC",
      parameters: [
        {
          name: "@type",
          value: MESSAGE_ATTRIBUTE,
        },
        {
          name: "@threadId",
          value: chatThreadID,
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

    const { resources } = await HistoryContainer()
      .items.query<ChatMessageModel>(querySpec)
      .fetchAll();

    return {
      status: "OK",
      response: resources,
    };
  } catch (e) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `${e}`,
        },
      ],
    };
  }
};

export const CreateChatMessage = async ({
  name,
  content,
  role,
  chatThreadId,
  multiModalImage,
}: {
  name: string;
  role: ChatRole;
  content: string;
  chatThreadId: string;
  multiModalImage?: string;
}): Promise<ServerActionResponse<ChatMessageModel>> => {
  const userId = await userHashedId();
  const modelToSave: ChatMessageModel = {
    id: uniqueId(),
    createdAt: new Date(),
    type: MESSAGE_ATTRIBUTE,
    isDeleted: false,
    content: content,
    name: name,
    role: role,
    threadId: chatThreadId,
    userId: userId,
    multiModalImage: multiModalImage,
  };
  return await UpsertChatMessage(modelToSave);
};

export const UpsertChatMessage = async (
  chatModel: ChatMessageModel
): Promise<ServerActionResponse<ChatMessageModel>> => {
  try {
    const modelToSave: ChatMessageModel = {
      ...chatModel,
      id: uniqueId(),
      createdAt: new Date(),
      type: MESSAGE_ATTRIBUTE,
      isDeleted: false,
    };

    const { resource } =
      await HistoryContainer().items.upsert<ChatMessageModel>(modelToSave);

    if (resource) {
      return {
        status: "OK",
        response: resource,
      };
    }

    return {
      status: "ERROR",
      errors: [
        {
          message: `Chat message not found`,
        },
      ],
    };
  } catch (e) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `${e}`,
        },
      ],
    };
  }
};
