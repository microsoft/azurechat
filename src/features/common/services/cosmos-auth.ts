import { CosmosClient } from "@azure/cosmos"

import logger from "@/features/insights/app-insights"

const _cosmosAccessToken: string | null = null

export const CONFIG = {
  endpoint: process.env.APIM_BASE,
  key: process.env.APIM_KEY,
  dbName: process.env.AZURE_COSMOSDB_DB_NAME || "localdev",
}
export type CosmosConfig = typeof CONFIG

export const getCosmosAccessToken = async ({ endpoint, key }: CosmosConfig): Promise<string> => {
  try {
    const response = await fetch(`${endpoint}/cosmos`, {
      method: "GET",
      headers: { "api-key": key },
      cache: "reload",
    })

    if (!response.ok) {
      logger.error(`🚀 > getCosmosAccessToken > ${response.status} ${response.statusText}`)
      throw new Error(`${response.statusText}`)
    }

    const token = await response.text()
    return token
  } catch (error) {
    throw new Error(`Failed to fetch Cosmos Auth Token: ${JSON.stringify(error)}`)
  }
}

export const isTokenExpired = (authToken: string | null = _cosmosAccessToken): boolean => {
  try {
    if (!authToken) return true
    const expiry = JSON.parse(Buffer.from(authToken.split(".")[1], "base64").toString()).exp
    const currentTime = Math.floor(Date.now() / 1000) // in seconds
    return expiry <= currentTime
  } catch (error) {
    throw new Error(`Failed to check token expiry: ${error}`)
  }
}

export async function createCosmosClient({ endpoint, key, ...rest }: CosmosConfig): Promise<CosmosClient> {
  const authToken = await getCosmosAccessToken({ endpoint, key, ...rest })
  const defaultHeaders = { "api-key": key, Authorization: `type=aad&ver=1.0&sig=${authToken}` }
  return new CosmosClient({ endpoint, defaultHeaders })
}
