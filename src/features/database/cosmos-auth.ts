import { CosmosClient, CosmosClientOptions } from "@azure/cosmos"
import { DeviceCodeCredential, DefaultAzureCredential } from "@azure/identity"

import logger from "@/features/insights/app-insights"

export const CONFIG = {
  endpoint: process.env.COSMOS_DB_ENDPOINT || "https://your-cosmos-account.documents.azure.com:443/",
  dbName: process.env.AZURE_COSMOSDB_DB_NAME || "localdev",
}
export type CosmosConfig = typeof CONFIG

let _cosmosClient: CosmosClient | null = null

/**
 * Create Cosmos Client with Azure AD Authentication
 * @param config CosmosConfig
 * @returns CosmosClient
 */
export function createCosmosClient(config: CosmosConfig = CONFIG): CosmosClient {
  if (_cosmosClient) return _cosmosClient

  try {
    const options: CosmosClientOptions = {
      endpoint: config.endpoint,
      aadCredentials:
        process.env.USE_DEVICE_CREDENTIAL === "true" ? new DeviceCodeCredential() : new DefaultAzureCredential(),
    }
    _cosmosClient = new CosmosClient(options)
    return _cosmosClient
  } catch (error) {
    logger.error(`Failed to create CosmosClient: ${JSON.stringify(error)}`)
    throw new Error(`Failed to create CosmosClient: ${JSON.stringify(error)}`)
  }
}
