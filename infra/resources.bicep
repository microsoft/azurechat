targetScope = 'resourceGroup'

param name string
param resourceToken string

param openai_api_key string
param openai_instance_name string
param openai_deployment_name string
param openai_api_version string

param location string
param tags object = {}

resource appServicePlan 'Microsoft.Web/serverfarms@2020-06-01' = {
  name: '${name}-app-${resourceToken}'
  location: location
  tags: tags
  properties: {
    reserved: true
  }
  sku: {
    name: 'P0v3'
    tier: 'Premium0V3'
    size: 'P0v3'
    family: 'Pv3'
    capacity: 1
  }
  kind: 'linux'
}

resource webApp 'Microsoft.Web/sites@2020-06-01' = {
  name: '${name}-app-${resourceToken}'
  location: location
  tags: tags
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'node|18-lts'
      alwaysOn: true
      appCommandLine: 'node server.js'
      appSettings: [
        {
          name: 'AZURE_COSMOSDB_URI'
          value: cosmosDbAccount.properties.documentEndpoint
        }
        {
          name: 'AZURE_COSMOSDB_KEY'
          value: cosmosDbAccount.listKeys().primaryMasterKey
        }
        {
          name: 'AZURE_OPENAI_API_KEY'
          value: openai_api_key
        }
        {
          name: 'AZURE_OPENAI_API_INSTANCE_NAME'
          value: openai_instance_name
        }
        {
          name: 'AZURE_OPENAI_API_DEPLOYMENT_NAME'
          value: openai_deployment_name
        }
        {
          name: 'AZURE_OPENAI_API_VERSION'
          value: openai_api_version
        }
        {
          name: 'NEXTAUTH_SECRET'
          value: '${name}app${resourceToken}'
        }
        {
          name: 'NEXTAUTH_URL'
          value: 'https://${name}-app-${resourceToken}.azurewebsites.net'
        }
      ]
    }
  }
}

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: '${name}-cosmos-${resourceToken}'
  location: location
  tags: tags
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
  }
}

output url string = 'https://${webApp.properties.defaultHostName}'
