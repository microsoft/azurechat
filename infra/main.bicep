targetScope = 'resourceGroup'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param name string

// azure open ai 
@description('Location for the OpenAI resource group')
@allowed(['canadaeast', 'eastus', 'francecentral', 'japaneast', 'northcentralus'])
@metadata({
  azd: {
    type: 'location'
  }
})
param openAILocation string

param openAISku string = 'S0'
param openAIApiVersion string = '2023-03-15-preview'

param chatGptDeploymentCapacity int = 30
param chatGptDeploymentName string = 'chat-gpt-35-turbo'
param chatGptModelName string = 'gpt-35-turbo'
param chatGptModelVersion string = '0613'
param embeddingDeploymentName string = 'embedding'
param embeddingDeploymentCapacity int = 10
param embeddingModelName string = 'text-embedding-ada-002'

param formRecognizerSkuName string = 'S0'
param searchServiceIndexName string = 'azure-chat'
param searchServiceSkuName string = 'standard'
param searchServiceAPIVersion string = '2023-07-01-Preview'

@minLength(1)
@description('Primary location for all resources')
param location string = resourceGroup().location

var resourceToken = toLower(uniqueString(subscription().id, name))
var tags = { 'intelligent-app': 'azure-chat' }

module resources 'resources.bicep' = {
  name: 'all-resources'
  scope: resourceGroup()
  params: {
    name: name
    resourceToken: resourceToken
    tags: tags
    openai_api_version: openAIApiVersion
    openAiResourceGroupLocation: openAILocation
    openAiSkuName: openAISku
    chatGptDeploymentCapacity: chatGptDeploymentCapacity
    chatGptDeploymentName: chatGptDeploymentName
    chatGptModelName: chatGptModelName
    chatGptModelVersion: chatGptModelVersion
    embeddingDeploymentName: embeddingDeploymentName
    embeddingDeploymentCapacity: embeddingDeploymentCapacity
    embeddingModelName: embeddingModelName
    formRecognizerSkuName: formRecognizerSkuName
    searchServiceIndexName: searchServiceIndexName
    searchServiceSkuName: searchServiceSkuName
    searchServiceAPIVersion: searchServiceAPIVersion
    location: location
  }
}

output APP_URL string = resources.outputs.url
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
