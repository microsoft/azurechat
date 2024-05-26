import { Container, CosmosClient, PartitionKeyDefinitionVersion, PartitionKeyKind } from "@azure/cosmos"
import { GetCosmosAccessToken } from "./cosmos-auth"

interface AuthToken {
  token: string
  expiry: number
}

let _cosmosClient: CosmosClient | null = null
let _authToken: AuthToken | null = null
let _tokenRefreshTimer: NodeJS.Timeout | null = null

const fetchAndSetAuthToken = async (): Promise<void> => {
  const token = await GetCosmosAccessToken()
  const expiry = Date.now() + 23 * 60 * 60 * 1000
  _authToken = { token, expiry }
  _cosmosClient = createCosmosClient(token)
  scheduleTokenRefresh()
}

const scheduleTokenRefresh = (): void => {
  if (_tokenRefreshTimer) {
    clearTimeout(_tokenRefreshTimer)
  }
  _tokenRefreshTimer = setTimeout(fetchAndSetAuthToken, 23 * 60 * 60 * 1000)
}

const createCosmosClient = (authToken: string): CosmosClient => {
  const endpoint = process.env.APIM_BASE
  const defaultHeaders = {
    "api-key": process.env.APIM_KEY || "",
    Authorization: `type=aad&ver=1.0&sig=${authToken}`,
  }
  if (!endpoint) throw new Error("Azure Cosmos DB is not configured. Please configure it in the .env file.")

  return new CosmosClient({ endpoint: endpoint, defaultHeaders: defaultHeaders })
}

const CosmosInstance = async (): Promise<CosmosClient> => {
  if (_cosmosClient && _authToken && Date.now() < _authToken.expiry) {
    return _cosmosClient
  }
  await fetchAndSetAuthToken()
  return _cosmosClient!
}

let _historyContainer: Container | null = null
export const HistoryContainer = async (): Promise<Container> => {
  if (_historyContainer) return _historyContainer

  const dbName = process.env.AZURE_COSMOSDB_DB_NAME || "localdev"
  const containerName = process.env.AZURE_COSMOSDB_CHAT_CONTAINER_NAME || "history"

  const client = await CosmosInstance()
  const { database } = await client.databases.createIfNotExists({ id: dbName })
  const { container } = await database.containers.createIfNotExists({
    id: containerName,
    partitionKey: {
      paths: ["/tenantId", "/userId"],
      kind: PartitionKeyKind.MultiHash,
      version: PartitionKeyDefinitionVersion.V2,
    },
  })

  _historyContainer = container
  return _historyContainer
}

let _userContainer: Container | null = null
export const UserContainer = async (): Promise<Container> => {
  if (_userContainer) return _userContainer

  const dbName = process.env.AZURE_COSMOSDB_DB_NAME || "localdev"
  const containerName = process.env.AZURE_COSMOSDB_USER_CONTAINER_NAME || "users"

  const client = await CosmosInstance()
  const { database } = await client.databases.createIfNotExists({ id: dbName })
  const { container } = await database.containers.createIfNotExists({
    id: containerName,
    partitionKey: {
      paths: ["/tenantId", "/userId"],
      kind: PartitionKeyKind.MultiHash,
      version: PartitionKeyDefinitionVersion.V2,
    },
  })

  _userContainer = container
  return _userContainer
}

let _tenantContainer: Container | null = null
export const TenantContainer = async (): Promise<Container> => {
  if (_tenantContainer) return _tenantContainer

  const dbName = process.env.AZURE_COSMOSDB_DB_NAME || "localdev"
  const containerName = process.env.AZURE_COSMOSDB_TENANT_CONTAINER_NAME || "tenants"

  const client = await CosmosInstance()
  const { database } = await client.databases.createIfNotExists({ id: dbName })
  const { container } = await database.containers.createIfNotExists({
    id: containerName,
    partitionKey: {
      paths: ["/tenantId"],
      kind: PartitionKeyKind.MultiHash,
      version: PartitionKeyDefinitionVersion.V2,
    },
  })

  _tenantContainer = container
  return _tenantContainer
}
