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

export const CreateCitations = async (
  models: DocumentSearchResponse[]
): Promise<Array<ServerActionResponse<ChatCitationModel>>> => {
  const items: Array<Promise<ServerActionResponse<ChatCitationModel>>> = [];

  for (const model of models) {
    const res = CreateCitation({
      content: model,
      id: uniqueId(),
      type: CHAT_CITATION_ATTRIBUTE,
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
      query: "SELECT * FROM root r WHERE r.type=@type AND r.id=@id",
      parameters: [
        {
          name: "@type",
          value: CHAT_CITATION_ATTRIBUTE,
        },
        {
          name: "@id",
          value: id,
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
