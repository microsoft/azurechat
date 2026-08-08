import "server-only";

import { FeatureFlags } from "./feature-flags-model";

const has = (value?: string) => !!value && value.trim().length > 0;
const useManagedIdentities = () =>
  process.env.USE_MANAGED_IDENTITIES === "true";

// Flags are derived from env presence at request time (the app is fully
// force-dynamic), so adding a service later only requires setting its app
// settings and restarting — no rebuild or code change.
export const GetFeatureFlags = (): FeatureFlags => {
  const mi = useManagedIdentities();

  return {
    // Azure Speech is key-auth only (no managed identity path in speech-service.ts)
    speechEnabled:
      has(process.env.AZURE_SPEECH_KEY) && has(process.env.AZURE_SPEECH_REGION),
    chatWithFileEnabled:
      has(process.env.AZURE_SEARCH_NAME) &&
      (mi || has(process.env.AZURE_SEARCH_API_KEY)) &&
      has(process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT) &&
      (mi || has(process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY)) &&
      has(process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME),
    imageGenEnabled:
      has(process.env.AZURE_OPENAI_DALLE_API_INSTANCE_NAME) &&
      has(process.env.AZURE_OPENAI_DALLE_API_DEPLOYMENT_NAME) &&
      (mi || has(process.env.AZURE_OPENAI_DALLE_API_KEY)) &&
      has(process.env.AZURE_STORAGE_ACCOUNT_NAME) &&
      (mi || has(process.env.AZURE_STORAGE_ACCOUNT_KEY)),
    // Key Vault always uses DefaultAzureCredential, so env presence alone
    // cannot prove Extensions will work — require an explicit opt-in.
    extensionsEnabled:
      process.env.EXTENSIONS_ENABLED === "true" &&
      has(process.env.AZURE_KEY_VAULT_NAME),
    // Vision input needs only the chat deployment; opt out if the deployed
    // model is not vision-capable.
    multimodalEnabled: process.env.MULTIMODAL_ENABLED !== "false",
  };
};
