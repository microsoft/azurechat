param name string = 'azurechat-demo'
param resourceToken string

param openai_api_version string

param openAiLocation string
param openAiSkuName string = 'S0'
param chatGptDeploymentCapacity int = 30
param chatGptDeploymentName string = 'chat-gpt-35-turbo'
param chatGptModelName string = 'chat-gpt-35-turbo'
param chatGptModelVersion string = '1106'
param embeddingDeploymentName string = 'text-embedding-ada-002'
param embeddingDeploymentCapacity int = 10
param embeddingModelName string = 'text-embedding-ada-002'

param dalleLocation string
param dalleDeploymentCapacity int
param dalleDeploymentName string
param dalleModelName string
param dalleApiVersion string

param gptvisionLocation string
param gptvisionDeploymentCapacity int = 30
param gptvisionDeploymentName string = 'gpt-4-vision'
param gptvisionModelName string = 'gpt-4'
param gptvisionApiVersion string = '2023-12-01-preview'
param gptvisionModelVersion string = 'vision-preview'

param speechServiceSkuName string = 'S0'

param formRecognizerSkuName string = 'S0'

param searchServiceSkuName string = 'standard'
param searchServiceIndexName string = 'azure-chat'

param storageServiceSku object
param storageServiceImageContainerName string

param location string = resourceGroup().location

@secure()
param nextAuthHash string = uniqueString(newGuid())

param tags object = {}

var openai_name = toLower('${name}-aillm-${resourceToken}')
var openai_dalle_name = toLower('${name}-aidalle-${resourceToken}')
var openai_gpt_vision_name = toLower('${name}-aivision-${resourceToken}')

var form_recognizer_name = toLower('${name}-form-${resourceToken}')
var speech_service_name = toLower('${name}-speech-${resourceToken}')
var cosmos_name = toLower('${name}-cosmos-${resourceToken}')
var search_name = toLower('${name}search${resourceToken}')
var webapp_name = toLower('${name}-webapp-${resourceToken}')
var appservice_name = toLower('${name}-app-${resourceToken}')
// storage name must be less than 24 chars, alphanumeric only - token is 13
var storage_prefix = take(name, 8)
var storage_name = toLower('${storage_prefix}sto${resourceToken}')
// keyvault name must be less than 24 chars - token is 13
var kv_prefix = take(name, 7)
var keyVaultName = toLower('${kv_prefix}-kv-${resourceToken}')
var la_workspace_name = toLower('${name}-la-${resourceToken}')
var diagnostic_setting_name = 'AppServiceConsoleLogs'

var keyVaultSecretsOfficerRole = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7')

var validStorageServiceImageContainerName = toLower(replace(storageServiceImageContainerName, '-', ''))

var databaseName = 'chat'
var historyContainerName = 'history'
var configContainerName = 'config'

var llmDeployments = [
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
          name: 'AZURE_KEY_VAULT_NAME'
          value: keyVaultName
        }
        { 
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'AZURE_OPENAI_VISION_API_KEY'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::AZURE_OPENAI_VISION_API_KEY.name})'
        }
        {
          name: 'AZURE_OPENAI_VISION_API_INSTANCE_NAME'
          value: openai_gpt_vision_name
        }
        {
          name: 'AZURE_OPENAI_VISION_API_DEPLOYMENT_NAME'
          value: gptvisionDeploymentName
        }
        {
          name: 'AZURE_OPENAI_VISION_API_VERSION'
          value: gptvisionApiVersion
        }
        {
          name: 'AZURE_OPENAI_API_KEY'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::AZURE_OPENAI_API_KEY.name})'
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
          name: 'AZURE_OPENAI_DALLE_API_KEY'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::AZURE_OPENAI_DALLE_API_KEY.name})'
        }
        {
          name: 'AZURE_OPENAI_DALLE_API_INSTANCE_NAME'
          value: openai_dalle_name
        }
        {
          name: 'AZURE_OPENAI_DALLE_API_DEPLOYMENT_NAME'
          value: dalleDeploymentName
        }
        {
          name: 'AZURE_OPENAI_DALLE_API_VERSION'
          value: dalleApiVersion
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
          name: 'AZURE_COSMOSDB_URI'
          value: cosmosDbAccount.properties.documentEndpoint
        }
        {
          name: 'AZURE_COSMOSDB_KEY'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::AZURE_COSMOSDB_KEY.name})'
        }
        {
          name: 'AZURE_SEARCH_API_KEY'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::AZURE_SEARCH_API_KEY.name})'
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
          name: 'AZURE_DOCUMENT_INTELLIGENCE_KEY'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::AZURE_DOCUMENT_INTELLIGENCE_KEY.name})'
        }
        {
          name: 'AZURE_SPEECH_REGION'
          value: location
        }
        {
          name: 'AZURE_SPEECH_KEY'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::AZURE_SPEECH_KEY.name})'
        }
        {
          name: 'AZURE_STORAGE_ACCOUNT_NAME'
          value: storage_name
        }
        {
          name: 'AZURE_STORAGE_ACCOUNT_KEY'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::AZURE_STORAGE_ACCOUNT_KEY.name})'
        }
      ]
    }
  }
  identity: { type: 'SystemAssigned'}

  resource configLogs 'config' = {
    name: 'logs'
    properties: {
      applicationLogs: { fileSystem: { level: 'Verbose' } }
      detailedErrorMessages: { enabled: true }
      failedRequestsTracing: { enabled: true }
      httpLogs: { fileSystem: { enabled: true, retentionInDays: 1, retentionInMb: 35 } }
    }
  }
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
  name: guid(kv.id, webApp.name, keyVaultSecretsOfficerRole)
  scope: kv
  properties: {
    principalId: webApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: keyVaultSecretsOfficerRole
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

  resource AZURE_OPENAI_VISION_API_KEY 'secrets' = {
    name: 'AZURE-OPENAI-VISION-API-KEY'
    properties: {
      contentType: 'text/plain'
      value: azureopenaivision.listKeys().key1
    }
  }

  resource AZURE_OPENAI_API_KEY 'secrets' = {
    name: 'AZURE-OPENAI-API-KEY'
    properties: {
      contentType: 'text/plain'
      value: azureopenai.listKeys().key1
    }
  }

  resource AZURE_OPENAI_DALLE_API_KEY 'secrets' = {
    name: 'AZURE-OPENAI-DALLE-API-KEY'
    properties: {
      contentType: 'text/plain'
      value: azureopenaidalle.listKeys().key1
    }
  }

  resource NEXTAUTH_SECRET 'secrets' = {
    name: 'NEXTAUTH-SECRET'
    properties: {
      contentType: 'text/plain'
      value: nextAuthHash
    }
  }

  resource AZURE_COSMOSDB_KEY 'secrets' = {
    name: 'AZURE-COSMOSDB-KEY'
    properties: {
      contentType: 'text/plain'
      value: cosmosDbAccount.listKeys().secondaryMasterKey
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

  resource AZURE_STORAGE_ACCOUNT_KEY 'secrets' = {
    name: 'AZURE-STORAGE-ACCOUNT-KEY'
    properties: {
      contentType: 'text/plain'
      value: storage.listKeys().keys[0].value
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
  name: databaseName
  parent: cosmosDbAccount
  properties: {
    resource: {
      id: databaseName
    }
  }
}

resource historyContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2022-05-15' = {
  name: historyContainerName
  parent: database
  properties: {
    resource: {
      id: historyContainerName
      partitionKey: {
        paths: [
          '/userId'
        ]
        kind: 'Hash'
      }
    }
  }
}

resource configContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2022-05-15' = {
  name: configContainerName
  parent: database
  properties: {
    resource: {
      id: configContainerName
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
  location: openAiLocation
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
resource llmdeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = [for deployment in llmDeployments: {
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

resource azureopenaidalle 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: openai_dalle_name
  location: dalleLocation
  tags: tags
  kind: 'OpenAI'
  properties: {
    customSubDomainName: openai_dalle_name
    publicNetworkAccess: 'Enabled'
  }
  sku: {
    name: openAiSkuName
  }

  resource dalleDeployment 'deployments' = {
    name: dalleDeploymentName
    properties: {
      model: {
        format: 'OpenAI'
        name: dalleModelName
      }
    }
    sku: {
      name: 'Standard'
      capacity: dalleDeploymentCapacity
    }
  }
}



resource azureopenaivision 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: openai_gpt_vision_name
  location: gptvisionLocation
  tags: tags
  kind: 'OpenAI'
  properties: {
    customSubDomainName: openai_gpt_vision_name
    publicNetworkAccess: 'Enabled'
  }
  sku: {
    name: openAiSkuName
  }

  resource dalleDeployment 'deployments' = {
    name: gptvisionDeploymentName
    properties: {
      model: {
        format: 'OpenAI'
        name: gptvisionModelName
        version:gptvisionModelVersion
      }
    }
    sku: {
      name: 'Standard'
      capacity: gptvisionDeploymentCapacity
    }
  }
}

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

// TODO: define good default Sku and settings for storage account
resource storage 'Microsoft.Storage/storageAccounts@2022-05-01' = {
  name: storage_name
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: storageServiceSku

  resource blobServices 'blobServices' = {
    name: 'default'
    resource container 'containers' = {
      name: validStorageServiceImageContainerName
      properties: {
        publicAccess: 'None'
      }
    }
  }
}

output url string = 'https://${webApp.properties.defaultHostName}'
