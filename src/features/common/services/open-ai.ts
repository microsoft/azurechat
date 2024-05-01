import { OpenAI } from "openai"

export const OpenAIInstance = (): OpenAI => {
  const openai = new OpenAI({
    apiKey: process.env.APIM_KEY,
    baseURL: `${process.env.APIM_BASE}/openai/deployments/${process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME}`,
    defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION || "2024-03-01-preview" },
    defaultHeaders: { "api-key": process.env.APIM_KEY },
  })
  return openai
}

export const OpenAIEmbeddingInstance = (): OpenAI => {
  if (
    !process.env.APIM_KEY ||
    !process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME ||
    !process.env.AZURE_OPENAI_API_INSTANCE_NAME
  ) {
    throw new Error("Azure OpenAI Embeddings endpoint config is not set, check environment variables.")
  }

  const openai = new OpenAI({
    apiKey: process.env.APIM_KEY,
    baseURL: `${process.env.APIM_BASE}/openai/deployments/${process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME}`,
    defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION || "2024-03-01-preview" },
    defaultHeaders: { "api-key": process.env.APIM_KEY },
  })
  return openai
}

export const OpenAIDALLEInstance = (): OpenAI => {
  if (
    !process.env.AZURE_OPENAI_DALLE_API_KEY ||
    !process.env.AZURE_OPENAI_DALLE_API_DEPLOYMENT_NAME ||
    !process.env.AZURE_OPENAI_DALLE_API_INSTANCE_NAME
  ) {
    throw new Error("Azure OpenAI DALLE endpoint config is not set, check environment variables.")
  }

  const openai = new OpenAI({
    apiKey: process.env.APIM_KEY,
    baseURL: `${process.env.APIM_BASE}/openai/deployments/${process.env.AZURE_OPENAI_DALLE_API_DEPLOYMENT_NAME}`,
    defaultQuery: {
      "api-version": process.env.AZURE_OPENAI_DALLE_API_VERSION || "2024-02-15-preview",
    },
    defaultHeaders: {
      "api-key": process.env.APIM_KEY,
    },
  })
  return openai
}

export const OpenAIVisionInstance = (): OpenAI => {
  if (
    !process.env.AZURE_OPENAI_VISION_API_KEY ||
    !process.env.AZURE_OPENAI_VISION_API_DEPLOYMENT_NAME ||
    !process.env.AZURE_OPENAI_VISION_API_INSTANCE_NAME ||
    !process.env.AZURE_OPENAI_VISION_API_VERSION
  ) {
    throw new Error("Azure OpenAI Vision environment config is not set, check environment variables.")
  }

  const openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_VISION_API_KEY,
    baseURL: `${process.env.APIM_BASE}/openai/deployments/${process.env.AZURE_OPENAI_VISION_API_DEPLOYMENT_NAME}`,
    defaultQuery: {
      "api-version": process.env.AZURE_OPENAI_VISION_API_VERSION,
    },
    defaultHeaders: { "api-key": process.env.APIM_KEY },
  })
  return openai
}
