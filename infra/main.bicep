targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param name string

@minLength(1)
@maxLength(64)
@description('Azure OpenAI API Key')
@secure()
param openaiApiKey string

@minLength(1)
@maxLength(64)
@description('Azure OpenAI Instance Name e.g. my-openai-instance')
param openaiInstanceName string

@minLength(1)
@maxLength(64)
@description('Azure OpenAI Deployment Name e.g. gpt3-turbo')
param openaiDeploymentName string

@minLength(1)
@maxLength(64)
@description('Azure OpenAI API Version e.g. 2023-03-15-preview')
param openaiApiVersion string = '2023-03-15-preview'

@minLength(1)
@description('Primary location for all resources')
param location string

param resourceGroupName string = ''

var resourceToken = toLower(uniqueString(subscription().id, name, location))
var tags = { 'azd-env-name': name }

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : 'rg-${name}'
  location: location
  tags: tags
}

module resources 'resources.bicep' = {
  name: 'resources-${resourceToken}'
  scope: rg
  params: {
    name: name
    location: location
    resourceToken: resourceToken
    tags: tags
    openai_api_key: openaiApiKey
    openai_instance_name: openaiInstanceName
    openai_deployment_name: openaiDeploymentName
    openai_api_version: openaiApiVersion
  }
}

output APP_URL string = resources.outputs.url
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
