import { CosmosClient, CosmosClientOptions, Container, PartitionKeyDefinition } from "@azure/cosmos"
import { DefaultAzureCredential, DeviceCodeCredential } from "@azure/identity"

import logger from "@/features/insights/app-insights"

export const CONFIG = {
  endpoint: process.env.COSMOS_DB_ENDPOINT || "https://your-cosmos-account.documents.azure.com:443/",
  dbName: process.env.AZURE_COSMOSDB_DB_NAME || "localdev",
}
export type CosmosConfig = typeof CONFIG

let cosmosClient: CosmosClient | null = null

/**
 * Create Cosmos Client with Azure AD Authentication
 * @param config CosmosConfig
 * @returns CosmosClient
 */
export function createCosmosClient(config: CosmosConfig): CosmosClient {
  if (cosmosClient) return cosmosClient

  try {
    let credential

    if (process.env.NODE_ENV === "development") {
      credential = new DeviceCodeCredential()
    } else {
      credential = new DefaultAzureCredential()
    }

    const options: CosmosClientOptions = {
      endpoint: config.endpoint,
      aadCredentials: credential,
    }

    cosmosClient = new CosmosClient(options)
    return cosmosClient
  } catch (error) {
    logger.error(`Failed to create CosmosClient: ${JSON.stringify(error)}`)
    throw new Error(`Failed to create CosmosClient: ${JSON.stringify(error)}`)
  }
}

const _containerCache: Map<string, Container> = new Map()

/**
 * Get or create a Cosmos DB container
 * @param containerName string
 * @param partitionKey string | PartitionKeyDefinition
 * @param config CosmosConfig
 * @returns Promise<Container>
 */
const getContainer = async (
  containerName: string,
  partitionKey: string | PartitionKeyDefinition,
  config: CosmosConfig
): Promise<Container> => {
  const client = createCosmosClient(config)
  const { database } = await client.databases.createIfNotExists({ id: config.dbName })
  const { container } = await database.containers.createIfNotExists({ id: containerName, partitionKey })
  return container
}

/**
 * Factory function to get or create a Cosmos DB container with caching
 * @param containerName string
 * @param partitionKey PartitionKeyDefinition
 * @param config CosmosConfig
 * @param containerCache Map<string, Container>
 * @returns Promise<Container>
 */
async function containerFactory(
  containerName: string,
  partitionKey: PartitionKeyDefinition,
  config: CosmosConfig = CONFIG,
  containerCache: Map<string, Container> = _containerCache
): Promise<Container> {
  if (!config?.endpoint) throw new Error("Azure Cosmos DB is not configured. Please configure it in the .env file.")

  if (containerCache.has(containerName)) return containerCache.get(containerName) as Container

  const container = await getContainer(containerName, partitionKey, config)

  containerCache.set(containerName, container)
  return container
}

export { containerFactory }
