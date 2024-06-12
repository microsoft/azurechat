import { userHashedId } from "@/features/auth-page/helpers";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { HistoryContainer } from "@/features/common/services/cosmos";
import { uniqueId } from "@/features/common/util";
import { SqlQuerySpec } from "@azure/cosmos";
import { DocumentSearchResponse } from "./azure-ai-search/azure-ai-search";
import { CHAT_CITATION_ATTRIBUTE, ChatCitationModel } from "./models";

export const CreateCitation = async (
  model: ChatCitationModel
): Promise<ServerActionResponse<ChatCitationModel>> => {
  try {
    const { resource } =
      await HistoryContainer().items.create<ChatCitationModel>(model);

    if (!resource) {
      return {
        status: "ERROR",
        errors: [{ message: "Citation not created" }],
      };
    }

    return {
      status: "OK",
      response: resource,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

// Create citations for the documents with a user as optional parameter
// when calling this method from the extension, you must provide the user as the REST API does not have access to the user
export const CreateCitations = async (
  models: DocumentSearchResponse[],
  userId?: string
): Promise<Array<ServerActionResponse<ChatCitationModel>>> => {
  const items: Array<Promise<ServerActionResponse<ChatCitationModel>>> = [];

  for (const model of models) {
    const res = CreateCitation({
      content: model,
      id: uniqueId(),
      type: CHAT_CITATION_ATTRIBUTE,
      userId: userId || (await userHashedId()),
    });

    items.push(res);
  }

  return await Promise.all(items);
};

export const FindCitationByID = async (
  id: string
): Promise<ServerActionResponse<ChatCitationModel>> => {
  try {
    const querySpec: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.type=@type AND r.id=@id AND r.userId=@userId ",
      parameters: [
        {
          name: "@type",
          value: CHAT_CITATION_ATTRIBUTE,
        },
        {
          name: "@id",
          value: id,
        },
        {
          name: "@userId",
          value: await userHashedId(),
        },
      ],
    };

    const { resources } = await HistoryContainer()
      .items.query<ChatCitationModel>(querySpec)
      .fetchAll();

    if (resources.length === 0) {
      return {
        status: "ERROR",
        errors: [{ message: "Citation not found" }],
      };
    }

    return {
      status: "OK",
      response: resources[0],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const FormatCitations = (citation: DocumentSearchResponse[]) => {
  const withoutEmbedding: DocumentSearchResponse[] = [];
  citation.forEach((d) => {
    withoutEmbedding.push({
      score: d.score,
      document: {
        metadata: d.document.metadata,
        pageContent: d.document.pageContent,
        chatThreadId: d.document.chatThreadId,
        id: "",
        user: "",
      },
    });
  });

  return withoutEmbedding;
};
