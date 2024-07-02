import AzureOpenAI from "openai"
interface OpenAIOptions {
  contentSafetyOn?: boolean
}

const getOpenAIInstance = (deploymentName: string, apiVersion: string): AzureOpenAI => {
  const apiKey = process.env.APIM_KEY
  const baseURL = `${process.env.APIM_BASE}/openai/deployments/${deploymentName}`

  if (!deploymentName || !apiKey) {
    throw new Error("Azure OpenAI endpoint config is not set, check environment variables.")
  }

  return new AzureOpenAI({
    apiKey,
    baseURL,
    defaultQuery: { "api-version": apiVersion },
    defaultHeaders: { "api-key": apiKey },
  })
}

export const OpenAIInstance = (options: OpenAIOptions = { contentSafetyOn: true }): AzureOpenAI => {
  const deployment = options.contentSafetyOn
    ? process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME
    : process.env.AZURE_OPENAI_API_NOCONTENTSAFETY_DEPLOYMENT_NAME
  return getOpenAIInstance(deployment, process.env.AZURE_OPENAI_API_VERSION)
}

export const OpenAIEmbeddingInstance = (): AzureOpenAI =>
  getOpenAIInstance(
    process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
    process.env.AZURE_OPENAI_API_EMBEDDINGS_VERSION
  )

export const OpenAIDALLEInstance = (): AzureOpenAI =>
  getOpenAIInstance(process.env.AZURE_OPENAI_DALLE_API_DEPLOYMENT_NAME, process.env.AZURE_OPENAI_DALLE_API_VERSION)

export const OpenAIVisionInstance = (): AzureOpenAI =>
  getOpenAIInstance(process.env.AZURE_OPENAI_VISION_API_DEPLOYMENT_NAME, process.env.AZURE_OPENAI_VISION_API_VERSION)
