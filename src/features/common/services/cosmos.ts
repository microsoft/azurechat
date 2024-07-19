import { Container, PartitionKeyDefinition } from "@azure/cosmos"

import { CONFIG, CosmosConfig, createCosmosClient, isTokenExpired } from "./cosmos-auth"

const _containerCache: Map<string, Container> = new Map()

const getContainer = async (
  containerName: string,
  partitionKey: string | PartitionKeyDefinition,
  config: CosmosConfig
): Promise<Container> => {
  const client = await createCosmosClient(config)
  const { database } = await client.databases.createIfNotExists({ id: config.dbName })
  const { container } = await database.containers.createIfNotExists({ id: containerName, partitionKey })
  return container
}

async function containerFactory(
  containerName: string,
  partitionKey: PartitionKeyDefinition,
  config: CosmosConfig = CONFIG,
  containerCache: Map<string, Container> = _containerCache
): Promise<Container> {
  if (!config?.endpoint || !config?.key)
    throw new Error("Azure Cosmos DB is not configured. Please configure it in the .env file.")

  if (containerCache.has(containerName) && !isTokenExpired()) return containerCache.get(containerName) as Container

  const container = await getContainer(containerName, partitionKey, config)

  containerCache.set(containerName, container)
  return container
}

export { containerFactory }
