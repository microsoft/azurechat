import { Container, CosmosClient, PartitionKeyDefinitionVersion, PartitionKeyKind } from "@azure/cosmos";

const DB_NAME = process.env.AZURE_COSMOSDB_DB_NAME || "localdev";
const CONTAINER_NAME = process.env.AZURE_COSMOSDB_CONTAINER_NAME || "history";

export const initDBContainer = async () => {
  const endpoint = process.env.AZURE_COSMOSDB_URI;
  const key = process.env.AZURE_COSMOSDB_KEY;
  const defaultHeaders = {'api-key': process.env.AZURE_SEARCH_API_KEY};

  const client = new CosmosClient({ endpoint, key, defaultHeaders });

  const databaseResponse = await client.databases.createIfNotExists({
    id: DB_NAME,
  });

  const containerResponse =
    await databaseResponse.database.containers.createIfNotExists({
      id: CONTAINER_NAME,
      partitionKey: {
        paths: ["/tenantId", "/userId"],
        kind: PartitionKeyKind.MultiHash,
        version: PartitionKeyDefinitionVersion.V2,
      },
    });

  return containerResponse.container;
};

export class CosmosDBContainer {
  private static instance: CosmosDBContainer;
  private container: Promise<Container>;

  private constructor() {
    const endpoint = process.env.AZURE_COSMOSDB_URI;
    const key = process.env.AZURE_COSMOSDB_KEY;
    const defaultHeaders = {'api-key': process.env.AZURE_SEARCH_API_KEY};

    const client = new CosmosClient({ endpoint, key, defaultHeaders });

    this.container = new Promise((resolve, reject) => {
      client.databases
        .createIfNotExists({
          id: DB_NAME,
        })
        .then((databaseResponse) => {
          databaseResponse.database.containers
            .createIfNotExists({
              id: CONTAINER_NAME,
              partitionKey: {
                paths: ["/tenantId", "/userId"],
                kind: PartitionKeyKind.MultiHash,
                version: PartitionKeyDefinitionVersion.V2,
              },
            })
            .then((containerResponse) => {
              resolve(containerResponse.container);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  public static getInstance(): CosmosDBContainer {
    if (!CosmosDBContainer.instance) {
      CosmosDBContainer.instance = new CosmosDBContainer();
    }

    return CosmosDBContainer.instance;
  }

  public async getContainer(): Promise<Container> {
    return await this.container;
  }
}
