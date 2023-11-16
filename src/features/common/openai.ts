import { OpenAI } from "openai";

export const OpenAIInstance = () => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: `https://${process.env.AZURE_OPENAI_API_ENDPOINT}/deployments/${process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME}`,
    defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
    defaultHeaders: { 
      "api-key": process.env.OPENAI_API_KEY, 
      "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY
    },
  });
  return openai;
};

export const OpenAIEmbeddingInstance = () => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: `https://${process.env.AZURE_OPENAI_API_ENDPOINT}/deployments/${process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME}`,
    defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
    defaultHeaders: { 
      "api-key": process.env.OPENAI_API_KEY, 
      "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY
    },
  });
  return openai;
};
