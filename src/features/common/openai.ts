import { OpenAI } from "openai";

export const OpenAIInstance = () => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: `https://${process.env.AZURE_OPENAI_API_ENDPOINT}`,
    defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
    defaultHeaders: { 
      "api-key": process.env.OPENAI_API_KEY, 
      "deployment-id": process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME
    },
  });
  return openai;
};

export const OpenAIEmbeddingInstance = () => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: `https://${process.env.AZURE_OPENAI_API_ENDPOINT}`,
    defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
    defaultHeaders: { 
      "api-key": process.env.OPENAI_API_KEY, 
      "deployment-id": process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME
    },
  });
  return openai;
};
