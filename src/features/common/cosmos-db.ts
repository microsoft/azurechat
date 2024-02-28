import { CosmosClient, Database, Container, PartitionKeyKind } from "@azure/cosmos";


const endpoint = process.env.AZURE_COSMOSDB_URI;
const key = process.env.AZURE_COSMOSDB_KEY;
const defaultHeaders = {'api-key': process.env.AZURE_SEARCH_API_KEY};

interface ExportedContainers {
  database: Database | null;
  usersContainer: Container | null;
  historyContainer: Container | null;
}

export const createDatabaseAndContainersIfNotExists = async (
  tenantId: string
): Promise<ExportedContainers> => {
  try {
    const client = new CosmosClient({ endpoint, key, defaultHeaders });

    const databaseId = `${tenantId}`;
    const databaseResponse = await client.databases.createIfNotExists({
      id: databaseId,
    });
    const database = databaseResponse.database;

    const usersContainerId = "users";
    const usersContainerResponse = await database.containers.createIfNotExists({
      id: usersContainerId,
      partitionKey: {
        paths: ["/tenantId", "/userId"],
        kind: PartitionKeyKind.MultiHash,
        version: 2
      },
    });
    const usersContainer = usersContainerResponse.container;

    const historyContainerId = "history";
    const historyContainerResponse = await database.containers.createIfNotExists({
      id: historyContainerId,
      partitionKey: {
        paths: ["/tenantId", "/userId"],
        kind: PartitionKeyKind.MultiHash,
        version: 2
      },
    });
    const historyContainer = historyContainerResponse.container;

    return {
      database,
      usersContainer,
      historyContainer,
    };
  } catch (error) {
    console.log(`Failed to create database and containers for tenant '${tenantId}':`, error);
    return {
      database: null,
      usersContainer: null,
      historyContainer: null,
    }; 
  }
};
