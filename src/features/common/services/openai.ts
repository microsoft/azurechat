import { OpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { AzureOpenAI } from "openai";

const USE_MANAGED_IDENTITIES = process.env.USE_MANAGED_IDENTITIES === "true";

export const OpenAIInstance =  (deploymentOverride?: string) => {
  const endpointSuffix = process.env.AZURE_OPENAI_API_ENDPOINT_SUFFIX || "openai.azure.com";
  const token = process.env.AZURE_OPENAI_API_KEY;

  // Resolve model/instance/deployment based on optional override
  const defaultInstance = process.env.AZURE_OPENAI_API_INSTANCE_NAME;
  const defaultDeployment = process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME;
  const defaultApiVersion = process.env.AZURE_OPENAI_API_VERSION;

  let instanceName = defaultInstance;
  let deploymentName = defaultDeployment;
  let apiVersion = defaultApiVersion;

  if (deploymentOverride) {
    for (let i = 1; ; i++) {
      const key = `AZURE_OPENAI_API_DEPLOYMENT_NAME_MODEL_${i}`;
      const instanceCandidate = process.env[key];
      // Failsafe
      if (!instanceCandidate && i > 100) break;
      if (!instanceCandidate) continue;
      if (instanceCandidate === deploymentOverride) {;
        const ver = process.env[`AZURE_OPENAI_API_VERSION_MODEL_${i}`];
        deploymentName = instanceCandidate;
        if (ver) apiVersion = ver;
        break;
      }
    }
  }

  if (USE_MANAGED_IDENTITIES) {
    const credential = new DefaultAzureCredential();
    const scope = "https://cognitiveservices.azure.com/.default";
    const azureADTokenProvider = getBearerTokenProvider(credential, scope);
    const client = new AzureOpenAI({
      azureADTokenProvider,
      deployment: deploymentName,
      apiVersion,
      baseURL: `https://${instanceName}.${endpointSuffix}/openai/deployments/${deploymentName}`
    });
     console.log(`Testdata baseURL: https://${instanceName}.${endpointSuffix}/openai/deployments/${deploymentName}`);
    return client;
  } else {
    const openai = new OpenAI({
      apiKey: token,
      baseURL: `https://${instanceName}.${endpointSuffix}/openai/deployments/${deploymentName}`,
      defaultQuery: { "api-version": apiVersion },
      defaultHeaders: { "api-key": token },
    });
    return openai;
  }
};

export const OpenAIEmbeddingInstance =  () => {
  const endpointSuffix = process.env.AZURE_OPENAI_API_ENDPOINT_SUFFIX || "openai.azure.com";
  let token = process.env.AZURE_OPENAI_API_KEY;
  if (USE_MANAGED_IDENTITIES) {
    const credential = new DefaultAzureCredential();
    const scope = "https://cognitiveservices.azure.com/.default";
    const azureADTokenProvider = getBearerTokenProvider(credential, scope);
    const deployment = process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
    const client = new AzureOpenAI({
      azureADTokenProvider,
      deployment,
      apiVersion,
      baseURL: `https://${process.env.AZURE_OPENAI_API_INSTANCE_NAME}.${endpointSuffix}/openai/deployments/${process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME}`
    });
    return client;
  } else {
    const openai = new OpenAI({
      apiKey: token,
      baseURL: `https://${process.env.AZURE_OPENAI_API_INSTANCE_NAME}.${endpointSuffix}/openai/deployments/${process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME}`,
      defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
      defaultHeaders: { "api-key": token },
    });
    return openai;
  }
};

// A new instance definition for DALL-E image generation
export const OpenAIDALLEInstance =  () => {
  const endpointSuffix = process.env.AZURE_OPENAI_API_ENDPOINT_SUFFIX || "openai.azure.com";
  let token = process.env.AZURE_OPENAI_DALLE_API_KEY;
  if (USE_MANAGED_IDENTITIES) {
    const credential = new DefaultAzureCredential();
    const scope = "https://cognitiveservices.azure.com/.default";
    const azureADTokenProvider = getBearerTokenProvider(credential, scope);
    const deployment = process.env.AZURE_OPENAI_DALLE_API_DEPLOYMENT_NAME;
    const apiVersion = process.env.AZURE_OPENAI_DALLE_API_VERSION || "2023-12-01-preview";
    const client = new AzureOpenAI({
      azureADTokenProvider,
      deployment,
      apiVersion,
      baseURL: `https://${process.env.AZURE_OPENAI_DALLE_API_INSTANCE_NAME}.${endpointSuffix}/openai/deployments/${process.env.AZURE_OPENAI_DALLE_API_DEPLOYMENT_NAME}`
    });
    return client;
  } else {
    const openai = new OpenAI({
      apiKey: token,
      baseURL: `https://${process.env.AZURE_OPENAI_DALLE_API_INSTANCE_NAME}.${endpointSuffix}/openai/deployments/${process.env.AZURE_OPENAI_DALLE_API_DEPLOYMENT_NAME}`,
      defaultQuery: { "api-version": process.env.AZURE_OPENAI_DALLE_API_VERSION || "2023-12-01-preview" },
      defaultHeaders: { "api-key": token },
    });
    return openai;
  }
};
