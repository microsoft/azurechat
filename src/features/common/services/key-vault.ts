import { DefaultAzureCredential } from "@azure/identity"
import { SecretClient } from "@azure/keyvault-secrets"

export const AzureKeyVaultInstance = (): SecretClient => {
  const credential = new DefaultAzureCredential()
  const keyVaultName = process.env.AZURE_KEY_VAULT_NAME

  if (!keyVaultName) {
    throw new Error("Azure Key vault is not configured correctly, check environment variables.")
  }
  const url = `https://${keyVaultName}.vault.azure.net`

  return new SecretClient(url, credential)
}
