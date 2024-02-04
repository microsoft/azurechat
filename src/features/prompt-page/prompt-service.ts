"use server";

import {
  ServerActionResponse,
  zodErrorsToServerActionErrors,
} from "@/features/common/server-action-response";
import {
  PROMPT_ATTRIBUTE,
  PromptModel,
  PromptModelSchema,
} from "@/features/prompt-page/models";
import { SqlQuerySpec } from "@azure/cosmos";
import { getCurrentUser, userHashedId } from "../auth-page/helpers";
import { ConfigContainer } from "../common/services/cosmos";
import { uniqueId } from "../common/util";

export const CreatePrompt = async (
  props: PromptModel
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const user = await getCurrentUser();

    if (!user.isAdmin) {
      return {
        status: "UNAUTHORIZED",
        errors: [
          {
            message: `Unable to create prompt`,
          },
        ],
      };
    }

    const modelToSave: PromptModel = {
      id: uniqueId(),
      name: props.name,
      description: props.description,
      isPublished: user.isAdmin ? props.isPublished : false,
      userId: await userHashedId(),
      createdAt: new Date(),
      type: "PROMPT",
    };

    const valid = ValidateSchema(modelToSave);

    if (valid.status !== "OK") {
      return valid;
    }

    const { resource } = await ConfigContainer().items.create<PromptModel>(
      modelToSave
    );

    if (resource) {
      return {
        status: "OK",
        response: resource,
      };
    } else {
      return {
        status: "ERROR",
        errors: [
          {
            message: "Error creating prompt",
          },
        ],
      };
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error creating prompt: ${error}`,
        },
      ],
    };
  }
};

export const FindAllPrompts = async (): Promise<
  ServerActionResponse<Array<PromptModel>>
> => {
  try {
    const querySpec: SqlQuerySpec = {
      query: "SELECT * FROM root r WHERE r.type=@type",
      parameters: [
        {
          name: "@type",
          value: PROMPT_ATTRIBUTE,
        },
      ],
    };

    const { resources } = await ConfigContainer()
      .items.query<PromptModel>(querySpec)
      .fetchAll();

    return {
      status: "OK",
      response: resources,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error retrieving prompt: ${error}`,
        },
      ],
    };
  }
};

export const EnsurePromptOperation = async (
  promptId: string
): Promise<ServerActionResponse<PromptModel>> => {
  const promptResponse = await FindPromptByID(promptId);
  const currentUser = await getCurrentUser();

  if (promptResponse.status === "OK") {
    if (currentUser.isAdmin) {
      return promptResponse;
    }
  }

  return {
    status: "UNAUTHORIZED",
    errors: [
      {
        message: `Prompt not found with id: ${promptId}`,
      },
    ],
  };
};

export const DeletePrompt = async (
  promptId: string
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const promptResponse = await EnsurePromptOperation(promptId);

    if (promptResponse.status === "OK") {
      const { resource: deletedPrompt } = await ConfigContainer()
        .item(promptId, promptResponse.response.userId)
        .delete();

      return {
        status: "OK",
        response: deletedPrompt,
      };
    }

    return promptResponse;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error deleting prompt: ${error}`,
        },
      ],
    };
  }
};

export const FindPromptByID = async (
  id: string
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const querySpec: SqlQuerySpec = {
      query: "SELECT * FROM root r WHERE r.type=@type AND r.id=@id",
      parameters: [
        {
          name: "@type",
          value: PROMPT_ATTRIBUTE,
        },
        {
          name: "@id",
          value: id,
        },
      ],
    };

    const { resources } = await ConfigContainer()
      .items.query<PromptModel>(querySpec)
      .fetchAll();

    if (resources.length === 0) {
      return {
        status: "NOT_FOUND",
        errors: [
          {
            message: "Prompt not found",
          },
        ],
      };
    }

    return {
      status: "OK",
      response: resources[0],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error finding prompt: ${error}`,
        },
      ],
    };
  }
};

export const UpsertPrompt = async (
  promptInput: PromptModel
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const promptResponse = await EnsurePromptOperation(promptInput.id);

    if (promptResponse.status === "OK") {
      const { response: prompt } = promptResponse;
      const user = await getCurrentUser();

      const modelToUpdate: PromptModel = {
        ...prompt,
        name: promptInput.name,
        description: promptInput.description,
        isPublished: user.isAdmin
          ? promptInput.isPublished
          : prompt.isPublished,
        createdAt: new Date(),
      };

      const validationResponse = ValidateSchema(modelToUpdate);
      if (validationResponse.status !== "OK") {
        return validationResponse;
      }

      const { resource } = await ConfigContainer().items.upsert<PromptModel>(
        modelToUpdate
      );

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
            message: "Error updating prompt",
          },
        ],
      };
    }

    return promptResponse;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error updating prompt: ${error}`,
        },
      ],
    };
  }
};

const ValidateSchema = (model: PromptModel): ServerActionResponse => {
  const validatedFields = PromptModelSchema.safeParse(model);

  if (!validatedFields.success) {
    return {
      status: "ERROR",
      errors: zodErrorsToServerActionErrors(validatedFields.error.errors),
    };
  }

  return {
    status: "OK",
    response: model,
  };
};
