import { getCurrentUser } from "@/features/auth-page/helpers";
import {
  CHAT_THREAD_ATTRIBUTE,
  ChatMessageModel,
  ChatThreadModel,
  MESSAGE_ATTRIBUTE,
} from "@/features/chat-page/chat-services/models";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { HistoryContainer } from "@/features/common/services/cosmos";
import { SqlQuerySpec } from "@azure/cosmos";

export interface ReportingFilter {
  user?: string;
  startDate?: string;
  endDate?: string;
}

export const FindAllChatThreadsForAdmin = async (
  limit: number,
  offset: number,
  filter: ReportingFilter = {}
): Promise<ServerActionResponse<Array<ChatThreadModel>>> => {
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    return {
      status: "ERROR",
      errors: [{ message: "You are not authorized to perform this action" }],
    };
  }

  try {
    const conditions = ["r.type=@type"];
    const parameters: SqlQuerySpec["parameters"] = [
      { name: "@type", value: CHAT_THREAD_ATTRIBUTE },
    ];

    const userTerm = filter.user?.trim();
    if (userTerm) {
      conditions.push("CONTAINS(LOWER(r.useName), LOWER(@user))");
      parameters.push({ name: "@user", value: userTerm });
    }

    // createdAt is stored as an ISO-8601 string, so lexical comparison is
    // chronological. The end date is pushed to the end of that day so the
    // range reads inclusively, the way a person picking two dates expects.
    if (filter.startDate) {
      conditions.push("r.createdAt >= @startDate");
      parameters.push({
        name: "@startDate",
        value: `${filter.startDate}T00:00:00.000Z`,
      });
    }
    if (filter.endDate) {
      conditions.push("r.createdAt <= @endDate");
      parameters.push({
        name: "@endDate",
        value: `${filter.endDate}T23:59:59.999Z`,
      });
    }

    parameters.push({ name: "@offset", value: offset });
    parameters.push({ name: "@limit", value: limit });

    const querySpec: SqlQuerySpec = {
      query: `SELECT * FROM root r WHERE ${conditions.join(
        " AND "
      )} ORDER BY r.createdAt DESC OFFSET @offset LIMIT @limit`,
      parameters,
    };

    const { resources } = await HistoryContainer()
      .items.query<ChatThreadModel>(querySpec)
      .fetchAll();
    return {
      status: "OK",
      response: resources,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const FindAllChatMessagesForAdmin = async (
  chatThreadID: string
): Promise<ServerActionResponse<Array<ChatMessageModel>>> => {
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    return {
      status: "ERROR",
      errors: [{ message: "You are not authorized to perform this action" }],
    };
  }

  try {
    const querySpec: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.type=@type AND r.threadId = @threadId ORDER BY r.createdAt ASC",
      parameters: [
        {
          name: "@type",
          value: MESSAGE_ATTRIBUTE,
        },
        {
          name: "@threadId",
          value: chatThreadID,
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
