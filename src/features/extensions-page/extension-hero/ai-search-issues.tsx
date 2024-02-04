import { uniqueId } from "@/features/common/util";
import { HeroButton } from "@/features/ui/hero";
import { FileSearch } from "lucide-react";
import { ExtensionModel } from "../extension-services/models";
import { extensionStore } from "../extension-store";

export const AISearch = () => {
  const newExample = () => {
    const aiSearchExample: ExtensionModel = {
      createdAt: new Date(),
      description: "Azure AI Search",
      id: "",
      name: "Bring your own Azure AI Search",
      executionSteps: `You are an expert in searching internal documents using aisearch function. You must always include a citation at the end of your answer and don't include a full stop after the citations. Use the format for your citation {% citation items=[{name:\\"filename 1\\",id:\\"file id\\"}, {name:\\"filename 2\\",id:\\"file id\\"}] /%}`,
      functions: [
        {
          code: `{
"name": "aisearch",
"parameters": {
  "type": "object",
  "properties": {
    "body": {
      "type": "object",
      "description": "Body of search for relevant information",
      "properties": {
        "search": {
          "type": "string",
          "description": "The exact search value from the user"
        }
      },
      "required": ["search"]
    }
  },
  "required": ["body"]
},
"description": "You must use this to search for content based on user questions."
}`,
          endpoint: "https:AZURE_CHAT_HOST.com/api/document",
          id: uniqueId(),
          endpointType: "POST",
          isOpen: false,
        },
      ],
      headers: [
        {
          id: uniqueId(),
          key: "vectors",
          value: "comma,separated,values of the vectors on the index",
        },
        {
          id: uniqueId(),
          key: "apiKey",
          value: "YOUR API KEY",
        },
        {
          id: uniqueId(),
          key: "searchName",
          value: "NAME OF AI SEARCH",
        },
        {
          id: uniqueId(),
          key: "indexName",
          value: "NAME OF THE SEARCH INDEX",
        },
      ],
      isPublished: false,
      type: "EXTENSION",
      userId: "",
    };

    extensionStore.openAndUpdate(aiSearchExample);
  };

  return (
    <HeroButton
      title="Azure AI Search"
      description="Bring your own Azure AI Search"
      icon={<FileSearch />}
      onClick={newExample}
    />
  );
};
