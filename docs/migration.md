# Migration

The following changes and services are required to migrate from the old version to the new version.

Refer the `.env.example` file for the latest environment variable changes.

If you previously had Azure Chat running and have pulled the v2 version you will need at minimum to make the following changes:

* Change the "OPENAI_API_KEY" environment setting to "AZURE_OPENAI_API_KEY"
* Add an additional container to your Cosmos DB database called "config" with a partition key of "/userId"
* Add the "AZURE_KEY_VAULT_NAME" environment setting with the name of your Azure Key Vault
* Add the "New Azure Services" settings below if you wish to use these features

## New Azure Services

1. **Azure OpenAI Service**: Create a new Azure OpenAI Service and deploy a DALL-E 3 model. DALL-E is available within the following [regions](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#dall-e-models-preview).

Once the model is deployed successfully, update the environment variables in the `.env.local` file and on Azure App settings.

```bash
# DALL-E image creation endpoint config
AZURE_OPENAI_DALLE_API_KEY=222222
AZURE_OPENAI_DALLE_API_INSTANCE_NAME=azurechat-dall-e
AZURE_OPENAI_DALLE_API_DEPLOYMENT_NAME=dall-e
AZURE_OPENAI_DALLE_API_VERSION=2023-12-01-preview
```

2. **Azure Blob Storage**: Create a new Azure Blob Storage account and update the environment variables in the `.env.local` file and on Azure App settings.

The Azure Blob Storage account is used to store the images created by the DALL-E model.

```bash
# Azure Storage account to store files
AZURE_STORAGE_ACCOUNT_NAME=azurechat
AZURE_STORAGE_ACCOUNT_KEY=123456
```

3. **Azure OpenAI Service**: Create a new Azure OpenAI Service and deploy a GPT 4 Vision model. The vision model is available within the following [regions](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#gpt-4-and-gpt-4-turbo-preview-model-availability).

Once the model is deployed successfully, update the environment variables in the `.env.local` file and on Azure App settings.

```bash
# GPT4 V OpenaAI details
AZURE_OPENAI_VISION_API_KEY=333333
AZURE_OPENAI_VISION_API_INSTANCE_NAME=azurechat-vision
AZURE_OPENAI_VISION_API_DEPLOYMENT_NAME=gpt-4-vision
AZURE_OPENAI_VISION_API_VERSION=2023-12-01-preview
```

## Existing Azure services

1. **Azure Key Vault**: The Azure Key Vault is already created and used to store the API Keys.

Update the environment variables in the `.env.local` file and on Azure App settings with the key vault name. The Extension feature uses the key vault to save and retrieve the secure header values.

```bash
# Azure Key Vault to store secrets
AZURE_KEY_VAULT_NAME=
```

2. **Azure Cosmos DB**: The Azure Cosmos DB is already created and used to store the chat data. The new version of the application segregates the data into two collections: `history` and `config`.

`history`: Stores the chat history data.

`config`: Stores the configuration data such as the prompt templates, extension details etc.

Update the environment variables in the `.env.local` file and on Azure App settings with the Cosmos DB account name and the database name.

```bash
# Update your Cosmos variables if you want to overwrite the default values
AZURE_COSMOSDB_DB_NAME=chat
AZURE_COSMOSDB_CONTAINER_NAME=history
# NOTE: Ensure the container is created within the Cosmos db database
AZURE_COSMOSDB_CONFIG_CONTAINER_NAME=config
```
