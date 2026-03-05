targetScope = 'subscription'

// Activates/Deactivates Authentication using keys. If true it will enforce RBAC using managed identities
@allowed([true, false])
@description('Enables/Disables Authentication using keys. If true it will enforce RBAC using managed identity and disable key auth on backend resouces')
param disableLocalAuth bool

@allowed([false, true])
@description('Enables/Disables Private Endpoints for backend Azure resources. If true, it will create a virtual network and subnets to host the private endpoints.')
param usePrivateEndpoints bool

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param name string

@minLength(1)
@description('Primary location for all resources')
param location string

// azure open ai -- regions currently support gpt-4o global-standard
@description('Location for the OpenAI resource group')
@allowed([
  'australiaeast'
  'brazilsouth'
  'canadaeast'
  'eastus'
  'eastus2'
  'francecentral'
  'germanywestcentral'
  'japaneast'
  'koreacentral'
  'northcentralus'
  'norwayeast'
  'polandcentral'
  'spaincentral'
  'southafricanorth'
  'southcentralus'
  'southindia'
  'swedencentral'
  'switzerlandnorth'
  'uksouth'
  'westeurope'
  'westus'
  'westus3'
])
@metadata({
  azd: {
    type: 'location'
  }
})
param openAILocation string

// DALL-E v3 only supported in limited regions for now
@description('Location for the OpenAI DALL-E 3 instance resource group')
@allowed(['swedencentral', 'eastus', 'australiaeast'])
@metadata({
  azd: {
    type: 'location'
  }
})
param dalleLocation string

param openAISku string = 'S0'
param openAIApiVersion string = '2024-08-01-preview'

param chatGptDeploymentCapacity int = 30
param chatGptDeploymentName string = 'gpt-4o'
param chatGptModelName string = 'gpt-4o'
param chatGptModelVersion string = '2024-05-13'
param embeddingDeploymentName string = 'embedding'
param embeddingDeploymentCapacity int = 120
param embeddingModelName string = 'text-embedding-ada-002'

param dalleDeploymentCapacity int = 1
param dalleDeploymentName string = 'dall-e-3'
param dalleModelName string = 'dall-e-3'
param dalleApiVersion string = '2023-12-01-preview'

param formRecognizerSkuName string = 'S0'
param searchServiceIndexName string = 'azure-chat'
param searchServiceSkuName string = 'standard'

// TODO: define good default Sku and settings for storage account
param storageServiceSku object = { name: 'Standard_LRS' }
param storageServiceImageContainerName string = 'images'

param resourceGroupName string = ''

param privateEndpointVNetPrefix string = '192.168.0.0/16'
param privateEndpointSubnetAddressPrefix string = '192.168.0.0/24'
param appServiceBackendSubnetAddressPrefix string = '192.168.1.0/24'

var resourceToken = toLower(uniqueString(subscription().id, name, location))
var tags = { 'azd-env-name': name }

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : 'rg-${name}'
  location: location
  tags: tags
}

module resources 'resources.bicep' = {
  name: 'all-resources'
  scope: rg
  params: {
    name: name
    resourceToken: resourceToken
    tags: tags
    openai_api_version: openAIApiVersion
    openAiLocation: openAILocation
    openAiSkuName: openAISku
    chatGptDeploymentCapacity: chatGptDeploymentCapacity
    chatGptDeploymentName: chatGptDeploymentName
    chatGptModelName: chatGptModelName
    chatGptModelVersion: chatGptModelVersion
    embeddingDeploymentName: embeddingDeploymentName
    embeddingDeploymentCapacity: embeddingDeploymentCapacity
    embeddingModelName: embeddingModelName
    dalleLocation: dalleLocation
    dalleDeploymentCapacity: dalleDeploymentCapacity
    dalleDeploymentName: dalleDeploymentName
    dalleModelName: dalleModelName
    dalleApiVersion: dalleApiVersion
    formRecognizerSkuName: formRecognizerSkuName
    searchServiceIndexName: searchServiceIndexName
    searchServiceSkuName: searchServiceSkuName
    storageServiceSku: storageServiceSku
    storageServiceImageContainerName: storageServiceImageContainerName
    location: location
    disableLocalAuth: disableLocalAuth
    usePrivateEndpoints: usePrivateEndpoints
    privateEndpointVNetPrefix: privateEndpointVNetPrefix
    privateEndpointSubnetAddressPrefix: privateEndpointSubnetAddressPrefix
    appServiceBackendSubnetAddressPrefix: appServiceBackendSubnetAddressPrefix
  }
}

output APP_URL string = resources.outputs.url
output AZURE_WEBAPP_NAME string = resources.outputs.webapp_name
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_RESOURCE_GROUP string = rg.name

output AZURE_OPENAI_API_INSTANCE_NAME string = resources.outputs.openai_name
output AZURE_OPENAI_API_DEPLOYMENT_NAME string = chatGptDeploymentName
output AZURE_OPENAI_API_VERSION string = openAIApiVersion
output AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME string = embeddingDeploymentName

output AZURE_OPENAI_DALLE_API_INSTANCE_NAME string = resources.outputs.openai_dalle_name
output AZURE_OPENAI_DALLE_API_DEPLOYMENT_NAME string = dalleDeploymentName
output AZURE_OPENAI_DALLE_API_VERSION string = dalleApiVersion

output AZURE_COSMOSDB_ACCOUNT_NAME string = resources.outputs.cosmos_name
output AZURE_COSMOSDB_URI string = resources.outputs.cosmos_endpoint
output AZURE_COSMOSDB_DB_NAME string = resources.outputs.database_name
output AZURE_COSMOSDB_CONTAINER_NAME string = resources.outputs.history_container_name
output AZURE_COSMOSDB_CONFIG_CONTAINER_NAME string = resources.outputs.config_container_name

output AZURE_SEARCH_NAME string = resources.outputs.search_name
output AZURE_SEARCH_INDEX_NAME string = searchServiceIndexName

output AZURE_DOCUMENT_INTELLIGENCE_NAME string = resources.outputs.form_recognizer_name
output AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT string = 'https://${resources.outputs.form_recognizer_name}.cognitiveservices.azure.com/'

output AZURE_SPEECH_REGION string = location
output AZURE_STORAGE_ACCOUNT_NAME string = resources.outputs.storage_name
output AZURE_KEY_VAULT_NAME string = resources.outputs.key_vault_name
