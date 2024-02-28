import { CosmosClient, PartitionKeyDefinitionVersion, PartitionKeyKind } from "@azure/cosmos";

const DB_NAME = process.env.AZURE_COSMOSDB_DB_NAME || "localdev";
const USER_PREFS_CONTAINER_NAME = process.env.AZURE_COSMOSDB_USER_CONTAINER_NAME || "userprefs";

export const initUserPrefsContainer = async () => {
  try {
    const endpoint = process.env.AZURE_COSMOSDB_URI;
    const key = process.env.AZURE_COSMOSDB_KEY;
    // Reintroducing defaultHeaders with 'api-key'
    const defaultHeaders = { 'api-key': process.env.AZURE_SEARCH_API_KEY };

    // Ensure the CosmosClient is correctly configured with defaultHeaders.
    const client = new CosmosClient({ endpoint, key, defaultHeaders });

    const databaseResponse = await client.databases.createIfNotExists({
      id: DB_NAME,
    });

    const containerResponse = await databaseResponse.database.containers.createIfNotExists({
      id: USER_PREFS_CONTAINER_NAME,
      partitionKey: {
        paths: ["/tenantId", "/userId"],
        kind: PartitionKeyKind.MultiHash,
        version: PartitionKeyDefinitionVersion.V2,
      },
    });

    return containerResponse.container;
  } catch (error) {
    console.log("Failed to initialize the User Preferences container:", error);
    throw error; // Rethrow or handle as appropriate for your application's error handling policy
  }
};
