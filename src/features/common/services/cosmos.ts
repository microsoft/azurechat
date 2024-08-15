import { Container, PartitionKeyDefinition } from "@azure/cosmos"

import { CONFIG, CosmosConfig, createCosmosClient } from "./cosmos-auth"

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
