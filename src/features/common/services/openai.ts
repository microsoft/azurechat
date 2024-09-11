import { OpenAI } from "openai";

export const OpenAIInstance = () => {
  const endpointSuffix = process.env.AZURE_OPENAI_API_ENDPOINT_SUFFIX || "openai.azure.com";
  const openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `https://${process.env.AZURE_OPENAI_API_INSTANCE_NAME}.${endpointSuffix}/openai/deployments/${process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME}`,
    defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
    defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
  });
  return openai;
};

export const OpenAIEmbeddingInstance = () => {
  if (
    !process.env.AZURE_OPENAI_API_KEY ||
    !process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME ||
    !process.env.AZURE_OPENAI_API_INSTANCE_NAME
  ) {
    throw new Error(
      "Azure OpenAI Embeddings endpoint config is not set, check environment variables."
    );
  }
  const endpointSuffix = process.env.AZURE_OPENAI_API_ENDPOINT_SUFFIX || "openai.azure.com";

  const openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `https://${process.env.AZURE_OPENAI_API_INSTANCE_NAME}.${endpointSuffix}/openai/deployments/${process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME}`,
    defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
    defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
  });
  return openai;
};

// a new instance definition for DALL-E image generation
export const OpenAIDALLEInstance = () => {
  if (
    !process.env.AZURE_OPENAI_DALLE_API_KEY ||
    !process.env.AZURE_OPENAI_DALLE_API_DEPLOYMENT_NAME ||
    !process.env.AZURE_OPENAI_DALLE_API_INSTANCE_NAME
  ) {
    throw new Error(
      "Azure OpenAI DALLE endpoint config is not set, check environment variables."
    );
  }
  const endpointSuffix = process.env.AZURE_OPENAI_API_ENDPOINT_SUFFIX || "openai.azure.com";

  const openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_DALLE_API_KEY,
    baseURL: `https://${process.env.AZURE_OPENAI_DALLE_API_INSTANCE_NAME}.${endpointSuffix}/openai/deployments/${process.env.AZURE_OPENAI_DALLE_API_DEPLOYMENT_NAME}`,
    defaultQuery: {
      "api-version":
        process.env.AZURE_OPENAI_DALLE_API_VERSION || "2023-12-01-preview",
    },
    defaultHeaders: {
      "api-key": process.env.AZURE_OPENAI_DALLE_API_KEY,
    },
  });
  return openai;
};
