import { CosmosClient } from "@azure/cosmos";

// Read Cosmos DB_NAME and CONTAINER_NAME from .env
const DB_NAME = process.env.AZURE_COSMOSDB_DB_NAME || "chat";
const CONTAINER_NAME = process.env.AZURE_COSMOSDB_CONTAINER_NAME || "history";
const CONFIG_CONTAINER_NAME =
  process.env.AZURE_COSMOSDB_CONFIG_CONTAINER_NAME || "config";

export const CosmosInstance = () => {
  const endpoint = process.env.AZURE_COSMOSDB_URI;
  const key = process.env.AZURE_COSMOSDB_KEY;

  if (!endpoint || !key) {
    throw new Error(
      "Azure Cosmos DB is not configured. Please configure it in the .env file."
    );
  }

  return new CosmosClient({ endpoint, key });
};

export const ConfigContainer = () => {
  const client = CosmosInstance();
  const database = client.database(DB_NAME);
  const container = database.container(CONFIG_CONTAINER_NAME);
  return container;
};

export const HistoryContainer = () => {
  const client = CosmosInstance();
  const database = client.database(DB_NAME);
  const container = database.container(CONTAINER_NAME);
  return container;
};
