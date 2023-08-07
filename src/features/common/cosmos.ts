"use server";
import { CosmosClient } from "@azure/cosmos";

// Read Cosmos DB_NAME and CONTAINER_NAME from .env
const DB_NAME = process.env.AZURE_COSMOSDB_DB_NAME || "chat";
const CONTAINER_NAME = process.env.AZURE_COSMOSDB_CONTAINER_NAME || "history";

export const initDBContainer = async () => {
  const endpoint = process.env.AZURE_COSMOSDB_URI;
  const key = process.env.AZURE_COSMOSDB_KEY;

  const client = new CosmosClient({ endpoint, key });

  const databaseResponse = await client.databases.createIfNotExists({
    id: DB_NAME,
  });

  const containerResponse =
    await databaseResponse.database.containers.createIfNotExists({
      id: CONTAINER_NAME,
      partitionKey: {
        paths: ["/userId"],
      },
    });

  return containerResponse.container;
};
