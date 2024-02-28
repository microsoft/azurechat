import { CosmosClient } from "@azure/cosmos";

const key = process.env.AZURE_COSMOSDB_KEY;
const endpoint = process.env.AZURE_COSMOSDB_URI;
const defaultHeaders = {'api-key': process.env.AZURE_SEARCH_API_KEY};

async function testCosmosDBConnection() {
    try {
        const client = new CosmosClient({ endpoint, key, defaultHeaders });
        const { resources: databases } = await client.databases.readAll().fetchAll();
        return true;
    }
    catch (error) {
        console.log("Failed to connect to CosmosDB:", error);
        return false;
    }
}

export { testCosmosDBConnection };