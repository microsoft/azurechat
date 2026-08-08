import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

export const AzureKeyVaultInstance = () => {
  const credential = new DefaultAzureCredential();
  const keyVaultName = process.env.AZURE_KEY_VAULT_NAME;

  if (!keyVaultName) {
    throw new Error(
      "Azure Key vault is not configured correctly, check environment variables."
    );
  }
  const endpointSuffix = process.env.AZURE_KEY_VAULT_ENDPOINT_SUFFIX || "vault.azure.net";
  const url = `https://${keyVaultName}.${endpointSuffix}`;

  return new SecretClient(url, credential);
};
