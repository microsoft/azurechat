"use server";
import { CosmosClient } from "@azure/cosmos";

const DB_NAME = "chat";
const CONTAINER_NAME = "history";

export const memoryContainer = async () => {
  const endpoint = process.env.AZURE_COSMOSEDB_URI!;
  const key = process.env.AZURE_COSMOSEDB_KEY!;
  const client = new CosmosClient({ endpoint, key });

  await client.databases.createIfNotExists({ id: DB_NAME });

  const containerRepose = await client
    .database(DB_NAME)
    .containers.createIfNotExists({ id: CONTAINER_NAME });

  return containerRepose.container;
};
