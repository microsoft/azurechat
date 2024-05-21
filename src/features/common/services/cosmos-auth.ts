/**
 * Calls Azure API Management Cosmos Auth API to fetch Access token returned on apim managed identity
 *
 * Managed Identity must be assigned built-in roles:
 *
 * - Cosmos DB Built-in Data Reader
 *
 * - Cosmos DB Built-in Data Contributor
 *
 * For more information
 *
 * - https://learn.microsoft.com/en-us/azure/cosmos-db/how-to-setup-rbac#built-in-role-definitions
 *
 * - Azure API Management /cosmos Policy
 * @returns Authorization Access Token
 */
export const GetCosmosAccessToken = async (): Promise<string> => {
  const response = await fetch(`${process.env.APIM_BASE}/cosmos`, {
    method: "GET",
    headers: {
      "api-key": process.env.APIM_KEY!,
    },
  })
  return response.text()
}
