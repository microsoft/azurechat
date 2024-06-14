"use server";
import "server-only";

import { getCurrentUser, userHashedId } from "@/features/auth-page/helpers";
import { UpsertChatThread } from "@/features/chat-page/chat-services/chat-thread-service";
import {
  CHAT_THREAD_ATTRIBUTE,
  ChatThreadModel,
} from "@/features/chat-page/chat-services/models";
import {
  ServerActionResponse,
  zodErrorsToServerActionErrors,
} from "@/features/common/server-action-response";
import { HistoryContainer } from "@/features/common/services/cosmos";
import { uniqueId } from "@/features/common/util";
import { SqlQuerySpec } from "@azure/cosmos";
import { PERSONA_ATTRIBUTE, PersonaModel, PersonaModelSchema } from "./models";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

interface PersonaInput {
  name: string;
  description: string;
  personaMessage: string;
  department: string;
  isPublished: boolean;
}

export const FindPersonaByID = async (
  id: string
): Promise<ServerActionResponse<PersonaModel>> => {
  try {
    const querySpec: SqlQuerySpec = {
      query: "SELECT * FROM root r WHERE r.type=@type AND r.id=@id",
      parameters: [
        {
          name: "@type",
          value: PERSONA_ATTRIBUTE,
        },
        {
          name: "@id",
          value: id,
        },
      ],
    };

    const { resources } = await HistoryContainer()
      .items.query<PersonaModel>(querySpec)
      .fetchAll();

    if (resources.length === 0) {
      return {
        status: "NOT_FOUND",
        errors: [
          {
            message: "Persona not found",
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
          message: `Error creating persona: ${error}`,
        },
      ],
    };
  }
};

export const CreatePersona = async (
  props: PersonaInput
): Promise<ServerActionResponse<PersonaModel>> => {
  try {
    const user = await getCurrentUser();

    const modelToSave: PersonaModel = {
      id: uniqueId(),
      name: props.name,
      description: props.description,
      personaMessage: props.personaMessage,
      department: props.department,
      isPublished: user.isAdmin ? props.isPublished : false,
      userId: await userHashedId(),
      createdAt: new Date(),
      type: "PERSONA",
    };

    const valid = ValidateSchema(modelToSave);

    if (valid.status !== "OK") {
      return valid;
    }

    const { resource } = await HistoryContainer().items.create<PersonaModel>(
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
            message: "Error creating persona",
          },
        ],
      };
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error creating persona: ${error}`,
        },
      ],
    };
  }
};

export const EnsurePersonaOperation = async (
  personaId: string
): Promise<ServerActionResponse<PersonaModel>> => {
  const personaResponse = await FindPersonaByID(personaId);
  const currentUser = await getCurrentUser();
  const hashedId = await userHashedId();

  if (personaResponse.status === "OK") {
    if (currentUser.isAdmin || personaResponse.response.userId === hashedId) {
      return personaResponse;
    }
  }

  return {
    status: "UNAUTHORIZED",
    errors: [
      {
        message: `Persona not found with id: ${personaId}`,
      },
    ],
  };
};

export const DeletePersona = async (
  personaId: string
): Promise<ServerActionResponse<PersonaModel>> => {
  try {
    const personaResponse = await EnsurePersonaOperation(personaId);

    if (personaResponse.status === "OK") {
      const { resource: deletedPersona } = await HistoryContainer()
        .item(personaId, personaResponse.response.userId)
        .delete();

      return {
        status: "OK",
        response: deletedPersona,
      };
    }

    return personaResponse;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error deleting persona: ${error}`,
        },
      ],
    };
  }
};

export const UpsertPersona = async (
  personaInput: PersonaModel
): Promise<ServerActionResponse<PersonaModel>> => {
  try {
    const personaResponse = await EnsurePersonaOperation(personaInput.id);

    if (personaResponse.status === "OK") {
      const { response: persona } = personaResponse;
      const user = await getCurrentUser();

      const modelToUpdate: PersonaModel = {
        ...persona,
        name: personaInput.name,
        description: personaInput.description,
        department: personaInput.department,
        personaMessage: personaInput.personaMessage,
        isPublished: user.isAdmin
          ? personaInput.isPublished
          : persona.isPublished,
        createdAt: new Date(),
      };

      const validationResponse = ValidateSchema(modelToUpdate);
      if (validationResponse.status !== "OK") {
        return validationResponse;
      }

      const { resource } = await HistoryContainer().items.upsert<PersonaModel>(
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
            message: "Error updating persona",
          },
        ],
      };
    }

    return personaResponse;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error updating persona: ${error}`,
        },
      ],
    };
  }
};
export const FindAllPersonaForCurrentUser = async (
  department: string
): Promise<ServerActionResponse<Array<PersonaModel>>> => {
  try {
    let querySpec: SqlQuerySpec;

    const user = await getCurrentUser();

    if (user.isAdmin) {
      // If user is admin, select all personas
      querySpec = {
        query: `
        SELECT * FROM root r 
        WHERE r.type=@type 
        AND (r.isPublished=@isPublished OR r.userId=@userId)
        ORDER BY r.createdAt DESC
      `,
        parameters: [
          {
            name: "@type",
            value: PERSONA_ATTRIBUTE,
          },
          {
            name: "@isPublished",
            value: true,
          },
          {
            name: "@userId",
            value: await userHashedId(),
          },
        ],
      };
    } else {
      // If user is not admin, select only their own personas and published ones
      querySpec = {
        query: `
        SELECT * FROM root r 
        WHERE r.type=@type 
        AND (r.isPublished=@isPublished OR r.userId=@userId OR r.department=@allDepartment)
        AND (r.department=@department OR r.department=@allDepartment)
        ORDER BY r.createdAt DESC
      `,
        parameters: [
          {
            name: "@type",
            value: PERSONA_ATTRIBUTE,
          },
          {
            name: "@isPublished",
            value: true,
          },
          {
            name: "@userId",
            value: await userHashedId(),
          },
          {
            name: "@department",
            value: department,
          },
          {
            name: "@allDepartment",
            value: "All Department",
          },
        ],
      };
    }

    const { resources } = await HistoryContainer()
      .items.query<PersonaModel>(querySpec)
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
          message: `Error finding persona: ${error}`,
        },
      ],
    };
  }
};
export const CreatePersonaChat = async (
  personaId: string
): Promise<ServerActionResponse<ChatThreadModel>> => {
  const personaResponse = await FindPersonaByID(personaId);
  const user = await getCurrentUser();

  if (personaResponse.status === "OK") {
    const persona = personaResponse.response;

    const response = await UpsertChatThread({
      name: persona.name,
      useName: user.name,
      userId: await userHashedId(),
      id: "",
      createdAt: new Date(),
      lastMessageAt: new Date(),
      bookmarked: false,
      isDeleted: false,
      type: CHAT_THREAD_ATTRIBUTE,
      personaMessage: persona.personaMessage,
      personaMessageTitle: persona.name,
      extension: [],
    });

    return response;
  }
  return personaResponse;
};

const ValidateSchema = (model: PersonaModel): ServerActionResponse => {
  const validatedFields = PersonaModelSchema.safeParse(model);

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
export async function getAllDepartments(req: any) {
  const token = await getToken({ req });

  // Modify the fetch request to match your needs
  const res = await fetch(
    "https://graph.microsoft.com/v1.0/users?$top=999&$select=department",
    {
      // Add the  access token to your request
      headers: { Authorization: `Bearer ${token?.accessToken}` },
    }
  );

  const data = await res.json();

  return NextResponse.json({ data });
}
