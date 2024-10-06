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


export const GetCredential = () => {
  return USE_MANAGED_IDENTITIES
    ? new DefaultAzureCredential()
    : new AzureKeyCredential(apiKey);
}

export const AzureAISearchInstance = <T extends object>() => {
  const credential = GetCredential();

  const searchClient = new SearchClient<T>(
    endpoint,
    indexName,
    credential
  );

  return searchClient;


};

export const AzureAISearchIndexClientInstance = () => {

  const credential = GetCredential();

  const searchClient = new SearchIndexClient(
    endpoint,
    credential
  );

  return searchClient;
};

export const AzureAISearchIndexerClientInstance = () => {

  const credential = GetCredential();

  const client = new SearchIndexerClient(
    endpoint,
    credential
  );

  return client;
};