import {
  AzureKeyCredential,
  SearchClient,
  SearchIndexClient,
  SearchIndexerClient,
} from "@azure/search-documents";

export const AzureAISearchCredentials = () => {
  const apiKey = process.env.AZURE_SEARCH_API_KEY;
  const searchName = process.env.AZURE_SEARCH_NAME;
  const indexName = process.env.AZURE_SEARCH_INDEX_NAME;

  if (!apiKey || !searchName || !indexName) {
    throw new Error(
      "One or more Azure AI Search environment variables are not set"
    );
  }

  const endpoint = `https://${searchName}.search.windows.net`;
  return {
    apiKey,
    endpoint,
    indexName,
  };
};

export const AzureAISearchInstance = <T extends object>() => {
  const { apiKey, endpoint, indexName } = AzureAISearchCredentials();

  const searchClient = new SearchClient<T>(
    endpoint,
    indexName,
    new AzureKeyCredential(apiKey)
  );

  return searchClient;
};

export const AzureAISearchIndexClientInstance = () => {
  const { apiKey, endpoint } = AzureAISearchCredentials();

  const searchClient = new SearchIndexClient(
    endpoint,
    new AzureKeyCredential(apiKey)
  );

  return searchClient;
};

export const AzureAISearchIndexerClientInstance = () => {
  const { apiKey, endpoint } = AzureAISearchCredentials();

  const client = new SearchIndexerClient(
    endpoint,
    new AzureKeyCredential(apiKey)
  );

  return client;
};
