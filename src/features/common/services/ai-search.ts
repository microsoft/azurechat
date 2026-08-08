import {
  AzureKeyCredential,
  SearchClient,
  SearchIndexClient,
  SearchIndexerClient,
} from "@azure/search-documents";
import { DefaultAzureCredential } from "@azure/identity";

const USE_MANAGED_IDENTITIES = process.env.USE_MANAGED_IDENTITIES === "true";
const endpointSuffix = process.env.AZURE_SEARCH_ENDPOINT_SUFFIX || "search.windows.net";
const apiKey = process.env.AZURE_SEARCH_API_KEY;
const searchName = process.env.AZURE_SEARCH_NAME;
const indexName = process.env.AZURE_SEARCH_INDEX_NAME;
const endpoint = `https://${searchName}.${endpointSuffix}`;
const debug = process.env.DEBUG === "true";

console.log("Configuration parameters:", {
  USE_MANAGED_IDENTITIES,
  endpointSuffix,
  searchName,
  indexName,
  endpoint,
});

export const GetCredential = () => {
  console.log("Getting credential using", USE_MANAGED_IDENTITIES ? "Managed Identities" : "API Key");
  const credential = USE_MANAGED_IDENTITIES
    ? new DefaultAzureCredential()
    : new AzureKeyCredential(apiKey);
  
  if (debug) console.log("Credential obtained:", credential);
  return credential;
}

export const AzureAISearchInstance = <T extends object>() => {
  console.log("Creating Azure AI Search Client Instance");
  const credential = GetCredential();

  const searchClient = new SearchClient<T>(
    endpoint,
    indexName,
    credential
  );

  console.log("Search Client created:", searchClient);
  return searchClient;
};

export const AzureAISearchIndexClientInstance = () => {
  console.log("Creating Azure AI Search Index Client Instance");
  const credential = GetCredential();

  const searchClient = new SearchIndexClient(
    endpoint,
    credential
  );

  console.log("Search Index Client created:", searchClient);
  return searchClient;
};

export const AzureAISearchIndexerClientInstance = () => {
  console.log("Creating Azure AI Search Indexer Client Instance");
  const credential = GetCredential();

  const client = new SearchIndexerClient(
    endpoint,
    credential
  );

  console.log("Search Indexer Client created:", client);
  return client;
};
