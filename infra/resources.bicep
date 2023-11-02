param name string = 'azurechat-demo'
param resourceToken string

param openai_api_version string

param openAiResourceGroupLocation string
param openAiSkuName string = 'S0'
param chatGptDeploymentCapacity int = 30
param chatGptDeploymentName string = 'chat-gpt-35-turbo'
param chatGptModelName string = 'chat-gpt-35-turbo'
param chatGptModelVersion string = '0613'
param embeddingDeploymentName string = 'text-embedding-ada-002'
param embeddingDeploymentCapacity int = 30
param embeddingModelName string = 'text-embedding-ada-002'

param speechServiceSkuName string = 'S0'
param formRecognizerSkuName string = 'S0'
param searchServiceSkuName string = 'standard'
param searchServiceIndexName string = 'azure-chat'
param searchServiceAPIVersion string = '2023-07-01-Preview'

param location string = resourceGroup().location

@secure()
param nextAuthHash string = uniqueString(newGuid())

param tags object = {}

var openai_name = toLower('${name}ai${resourceToken}')
var form_recognizer_name = toLower('${name}-form-${resourceToken}')
var speech_service_name = toLower('${name}-speech-${resourceToken}')
var cosmos_name = toLower('${name}-cosmos-${resourceToken}')
var search_name = toLower('${name}search${resourceToken}')
var webapp_name = toLower('${name}-webapp-${resourceToken}')
var appservice_name = toLower('${name}-app-${resourceToken}')
// keyvault name must be less than 24 chars - token is 13
var kv_prefix = take(name, 7)
var keyVaultName = toLower('${kv_prefix}-kv-${resourceToken}')
var la_workspace_name = toLower('${name}-la-${resourceToken}')
var diagnostic_setting_name = 'AppServiceConsoleLogs'

var keyVaultSecretsUserRole = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')

var databaseName = 'chat'
var containerName = 'history'

var deployments = [
  {
    name: chatGptDeploymentName
    model: {
      format: 'OpenAI'
      name: chatGptModelName
      version: chatGptModelVersion
    }
    sku: {
      name: 'Standard'
      capacity: chatGptDeploymentCapacity
    }
  }
  {
    name: embeddingDeploymentName
    model: {
      format: 'OpenAI'
      name: embeddingModelName
      version: '2'
    }
    capacity: embeddingDeploymentCapacity
  }
]

resource appServicePlan 'Microsoft.Web/serverfarms@2020-06-01' = {
  name: appservice_name
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
  name: webapp_name
  location: location
  tags: union(tags, { 'azd-service-name': 'frontend' })
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'node|18-lts'
      alwaysOn: true
      appCommandLine: 'next start'
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appSettings: [ 
        {
          name: 'AZURE_COSMOSDB_KEY'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::AZURE_COSMOSDB_KEY.name})'
        }
        {
          name: 'OPENAI_API_KEY'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::OPENAI_API_KEY.name})'
        }
        {
          name: 'AZURE_DOCUMENT_INTELLIGENCE_KEY'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::AZURE_DOCUMENT_INTELLIGENCE_KEY.name})'
        }
        {
          name: 'AZURE_SEARCH_API_KEY'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::AZURE_SEARCH_API_KEY.name})'
        }
        { 
          name: 'AZURE_SEARCH_API_VERSION'
          value: searchServiceAPIVersion
        }
        { 
          name: 'AZURE_SEARCH_NAME'
          value: search_name
        }
        { 
          name: 'AZURE_SEARCH_INDEX_NAME'
          value: searchServiceIndexName
        }
        { 
          name: 'AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT'
          value: 'https://${form_recognizer_name}.cognitiveservices.azure.com/'
        }
        { 
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'AZURE_COSMOSDB_URI'
          value: cosmosDbAccount.properties.documentEndpoint
        }
        {
          name: 'AZURE_OPENAI_API_INSTANCE_NAME'
          value: openai_name
        }
        {
          name: 'AZURE_OPENAI_API_DEPLOYMENT_NAME'
          value: chatGptDeploymentName
        }
        {
          name: 'AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME'
          value: embeddingDeploymentName
        }
        {
          name: 'AZURE_OPENAI_API_VERSION'
          value: openai_api_version
        }
        {
          name: 'NEXTAUTH_SECRET'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::NEXTAUTH_SECRET.name})'
        }
        {
          name: 'NEXTAUTH_URL'
          value: 'https://${webapp_name}.azurewebsites.net'
        }
        {
          name: 'AZURE_SPEECH_REGION'
          value: resourceGroup().location
        }
        {
          name: 'AZURE_SPEECH_KEY'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::AZURE_SPEECH_KEY.name})'
        }
      ]
    }
  }
  identity: { type: 'SystemAssigned'}
}

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2021-12-01-preview' = {
  name: la_workspace_name
  location: location
}

resource webDiagnosticSettings 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: diagnostic_setting_name
  scope: webApp
  properties: {
    workspaceId: logAnalyticsWorkspace.id
    logs: [
      {
        category: 'AppServiceConsoleLogs'
        enabled: true
      }
    ]
    metrics: []
  }
}

resource kvFunctionAppPermissions 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = {
  name: guid(kv.id, webApp.name, keyVaultSecretsUserRole)
  scope: kv
  properties: {
    principalId: webApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: keyVaultSecretsUserRole
  }
}

resource kv 'Microsoft.KeyVault/vaults@2021-06-01-preview' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enabledForDeployment: false
    enabledForDiskEncryption: true
    enabledForTemplateDeployment: false
  }

  resource AZURE_COSMOSDB_KEY 'secrets' = {
    name: 'AZURE-COSMOSDB-KEY'
    properties: {
      contentType: 'text/plain'
      value: cosmosDbAccount.listKeys().secondaryMasterKey
    }
  }

  resource OPENAI_API_KEY 'secrets' = {
    name: 'AZURE-OPENAI-API-KEY'
    properties: {
      contentType: 'text/plain'
      value: azureopenai.listKeys().key1
    }
  }

  resource AZURE_DOCUMENT_INTELLIGENCE_KEY 'secrets' = {
    name: 'AZURE-DOCUMENT-INTELLIGENCE-KEY'
    properties: {
      contentType: 'text/plain'
      value: formRecognizer.listKeys().key1
    }
  }

  resource AZURE_SPEECH_KEY 'secrets' = {
    name: 'AZURE-SPEECH-KEY'
    properties: {
      contentType: 'text/plain'
      value: speechService.listKeys().key1
    }
  }


  resource AZURE_SEARCH_API_KEY 'secrets' = {
    name: 'AZURE-SEARCH-API-KEY'
    properties: {
      contentType: 'text/plain'
      value: searchService.listAdminKeys().secondaryKey
    }
  }

  resource NEXTAUTH_SECRET 'secrets' = {
    name: 'NEXTAUTH-SECRET'
    properties: {
      contentType: 'text/plain'
      value: nextAuthHash
    }
  }
}

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: cosmos_name
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
    disableKeyBasedMetadataWriteAccess: true
  }
}

resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2022-05-15' = {
  name: '${cosmosDbAccount.name}/${databaseName}'
  properties: {
    resource: {
      id: databaseName
    }
  }
}

resource container 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2022-05-15' = {
  name: '${database.name}/${containerName}'
  properties: {
    resource: {
      id: containerName
      partitionKey: {
        paths: [
          '/userId'
        ]
        kind: 'Hash'
      }
    }
  }
}

resource formRecognizer 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: form_recognizer_name
  location: location
  tags: tags
  kind: 'FormRecognizer'
  properties: {
    customSubDomainName: form_recognizer_name
    publicNetworkAccess: 'Enabled'
  }
  sku: {
    name: formRecognizerSkuName
  }
}

resource searchService 'Microsoft.Search/searchServices@2022-09-01' = {
  name: search_name
  location: location
  tags: tags
  properties: {
    partitionCount: 1
    publicNetworkAccess: 'enabled'
    replicaCount: 1
  }
  sku: {
    name: searchServiceSkuName
  }
}

resource azureopenai 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: openai_name
  location: openAiResourceGroupLocation
  tags: tags
  kind: 'OpenAI'
  properties: {
    customSubDomainName: openai_name
    publicNetworkAccess: 'Enabled'
  }
  sku: {
    name: openAiSkuName
  }
}

@batchSize(1)
resource deployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = [for deployment in deployments: {
  parent: azureopenai
  name: deployment.name
  properties: {
    model: deployment.model
    raiPolicyName: contains(deployment, 'raiPolicyName') ? deployment.raiPolicyName : null
  }
  sku: contains(deployment, 'sku') ? deployment.sku : {
    name: 'Standard'
    capacity: deployment.capacity
  }
}]

resource speechService 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: speech_service_name
  location: location
  tags: tags
  kind: 'SpeechServices'
  properties: {
    customSubDomainName: speech_service_name
    publicNetworkAccess: 'Enabled'
  }
  sku: {
    name: speechServiceSkuName
  }
}

output url string = 'https://${webApp.properties.defaultHostName}'
