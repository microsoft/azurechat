/**
 * Calls Azure API Management Cosmos Auth API to fetch an access token returned on APIM managed identity.
 *
 * Managed Identity must be assigned the following built-in roles:
 * - Cosmos DB Built-in Data Reader
 * - Cosmos DB Built-in Data Contributor
 *
 * For more information:
 * - [RBAC for Azure Cosmos DB](https://learn.microsoft.com/en-us/azure/cosmos-db/how-to-setup-rbac#built-in-role-definitions)
 * - [Azure API Management /cosmos Policy](https://docs.microsoft.com/en-us/azure/api-management/api-management-access-restriction-policies#cosmos)
 *
 * @returns The authorization access token.
 */
export const GetCosmosAccessToken = async (): Promise<string> => {
  try {
    const response = await fetch(`${process.env.APIM_BASE}/cosmos`, {
      method: "GET",
      headers: {
        "api-key": process.env.APIM_KEY!,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`)
    }

    const token = await response.text()
    return token
  } catch (error) {
    throw new Error(`Failed to fetch Cosmos Auth Token: ${error}`)
  }
}

/**
 * Get the expiry date time of the token
 *
 * @param authToken Authorization Access Token
 * @returns Expiry date time of the token
 */
export const getTokenExpiry = (authToken: string): number => {
  try {
    const expiry = JSON.parse(Buffer.from(authToken.split(".")[1], "base64").toString()).exp
    return expiry
  } catch (error) {
    throw new Error(`Failed to check token expiry: ${error}`)
  }
}
