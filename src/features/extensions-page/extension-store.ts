import { proxy, useSnapshot } from "valtio";
import { RevalidateCache } from "../common/navigation-helpers";
import { ServerActionError } from "../common/server-action-response";
import { uniqueId } from "../common/util";
import {
  CreateExtension,
  UpdateExtension,
} from "./extension-services/extension-service";
import {
  EndpointType,
  ExtensionFunctionModel,
  ExtensionModel,
  HeaderModel,
} from "./extension-services/models";

interface FormState {
  success: boolean;
  errors: ServerActionError[];
}

class ExtensionState {
  public formState: FormState = {
    success: false,
    errors: [],
  };

  public defaultModel: ExtensionModel = this.createDefaultModel();

  public isLoading: boolean = false;
  public isOpened: boolean = false;
  public extension: ExtensionModel = { ...this.defaultModel };

  private createDefaultModel(): ExtensionModel {
    return {
      id: "",
      name: "",
      description: "",
      executionSteps: "",
      createdAt: new Date(),
      isPublished: false,
      type: "EXTENSION",
      functions: [],
      headers: [
        {
          id: uniqueId(),
          key: "Content-Type",
          value: "application/json",
        },
      ],
      userId: "",
    };
  }

  private createDefaultFunction(): ExtensionFunctionModel {
    const defaultFunction: ExtensionFunctionModel = {
      id: uniqueId(),
      code: exampleFunction,
      endpoint: "",
      endpointType: "GET",
      isOpen: false,
    };
    return defaultFunction;
  }

  public async submitForm(modelToSubmit: ExtensionModel) {
    this.isLoading = true;
    this.formState = {
      success: true,
      errors: [],
    };

    const response =
      modelToSubmit.id === ""
        ? await CreateExtension(modelToSubmit)
        : await UpdateExtension(modelToSubmit);

    if (response.status !== "OK") {
      this.formState = {
        success: false,
        errors: response.errors,
      };
    } else {
      RevalidateCache({
        page: "extensions",
      });
    }

    this.isLoading = false;
    this.isOpened = !this.formState.success;
  }

  public updateOpened(value: boolean) {
    this.isOpened = value;
    if (!value) {
      RevalidateCache({
        page: "extensions",
      });
    }
  }

  public addFunction() {
    this.extension.functions.push({
      ...this.createDefaultFunction(),
      id: uniqueId(),
    });
  }

  public cloneFunction(functionModel: ExtensionFunctionModel) {
    const clonedFunction = { ...functionModel, id: uniqueId() };
    this.extension.functions.push(clonedFunction);
  }

  public updateFunctionCode(id: string, value: string) {
    const functionToUpdate = this.extension.functions.find((f) => f.id === id);
    if (functionToUpdate) {
      functionToUpdate.code = value;
    }
  }

  public addEndpointHeader(props: { key: string; value: string }) {
    const { key, value } = props;
    this.extension.headers.push({
      id: uniqueId(),
      key,
      value,
    });
  }

  public removeFunction(id: string) {
    this.extension.functions = this.extension.functions.filter(
      (f) => f.id !== id
    );
  }

  public openAndUpdate(models: ExtensionModel) {
    models.functions.forEach((f) => {
      f.isOpen = false;
    });

    this.extension = {
      ...models,
    };
    this.resetAndOpenSlider();
  }

  public newAndOpenSlider() {
    this.extension = this.createDefaultModel();
    this.resetAndOpenSlider();
  }

  public resetAndOpenSlider() {
    this.isOpened = true;
    this.formState = {
      success: false,
      errors: [],
    };
  }

  public toggleFunction(functionId: string) {
    const functionToToggle = this.extension.functions.find(
      (f) => f.id === functionId
    );
    if (functionToToggle) {
      functionToToggle.isOpen = !functionToToggle.isOpen;
    }
  }

  public removeHeader(props: { headerId: string }) {
    const { headerId } = props;
    this.extension.headers = this.extension.headers.filter(
      (h) => h.id !== headerId
    );
  }
}

export const extensionStore = proxy(new ExtensionState());

export const useExtensionState = () => {
  return useSnapshot(extensionStore, {
    sync: true,
  });
};

export const AddOrUpdateExtension = async (
  previous: any,
  formData: FormData
) => {
  const modelToSubmit = FormToExtensionModel(formData);
  await extensionStore.submitForm(modelToSubmit);
};

export const FormToExtensionModel = (formData: FormData): ExtensionModel => {
  const headerKeys = formData.getAll("header-key[]");
  const headerValues = formData.getAll("header-value[]");
  const headerIds = formData.getAll("header-id[]");

  const headers: Array<HeaderModel> = headerKeys.map((k, index) => {
    return {
      id: headerIds[index] as string,
      key: k as string,
      value: headerValues[index] as string,
    };
  });

  const endpointTypes = formData.getAll("endpoint-type[]");
  const endpoints = formData.getAll("endpoint[]");
  const codes = formData.getAll("code[]");
  const functions: Array<ExtensionFunctionModel> = endpointTypes.map(
    (endpointType, index) => {
      return {
        id: uniqueId(),
        endpointType: endpointType as EndpointType,
        endpoint: endpoints[index] as string,
        code: codes[index] as string,
        isOpen: false,
      };
    }
  );

  return {
    id: formData.get("id") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    executionSteps: formData.get("executionSteps") as string,
    isPublished: formData.get("isPublished") === "on" ? true : false,
    userId: "", // the user id is set on the server once the user is authenticated
    createdAt: new Date(),
    type: "EXTENSION",
    functions: functions,
    headers: headers,
  };
};

export const exampleFunction = `{
  "name": "UpdateGitHubIssue",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "object",
        "description": "Query parameters",
        "properties": {
          "ISSUE_NUMBER": {
            "type": "string",
            "description": "Github issue number",
            "example": "123"
          }
        },
        "example": {
          "ISSUE_NUMBER": "123"
        },
        "required": ["ISSUE_NUMBER"]
      },
      "body": {
        "type": "object",
        "description": "Body of the GitHub issue",
        "properties": {
          "title": {
            "type": "string",
            "description": "Title of the issue",
            "example": "I'm having a problem with this."
          },
          "body": {
            "type": "string",
            "description": "Body of the issue",
            "example": "I'm having a problem with this."
          },
          "labels": {
            "type": "array",
            "description": "Labels to add to the issue",
            "items": {
              "type": "string",
              "example": "bug"
            }
          }
        },
        "example": {
          "title": "I'm having a problem with this.",
          "body": "I'm having a problem with this.",
          "labels": ["bug"]
        },
        "required": ["title"]
      }
    },
    "required": ["body", "query"]
  },
  "description": "You must use this to only update an existing GitHub issue"
}`;
