param name string = 'azurechat-demo'
param resourceToken string

param openai_api_version string

param openAiLocation string
param openAiSkuName string 
param chatGptDeploymentCapacity int 
param chatGptDeploymentName string
param chatGptModelName string 
param chatGptModelVersion string
param embeddingDeploymentName string 
param embeddingDeploymentCapacity int
param embeddingModelName string 

param dalleLocation string
param dalleDeploymentCapacity int
param dalleDeploymentName string
param dalleModelName string
param dalleApiVersion string

param speechServiceSkuName string = 'S0'

param formRecognizerSkuName string = 'S0'

param searchServiceSkuName string = 'standard'
param searchServiceIndexName string = 'azure-chat'

param storageServiceSku object
param storageServiceImageContainerName string

param location string = resourceGroup().location

param disableLocalAuth bool= false

@secure()
param nextAuthHash string = uniqueString(newGuid())

param tags object = {}

var openai_name = toLower('${name}-aillm-${resourceToken}')
var openai_dalle_name = toLower('${name}-aidalle-${resourceToken}')

var form_recognizer_name = toLower('${name}-form-${resourceToken}')
var speech_service_name = toLower('${name}-speech-${resourceToken}')
var cosmos_name = toLower('${name}-cosmos-${resourceToken}')
var search_name = toLower('${name}search${resourceToken}')
var webapp_name = toLower('${name}-webapp-${resourceToken}')
var appservice_name = toLower('${name}-app-${resourceToken}')
// storage name must be < 24 chars, alphanumeric only. 'sto' is 3 and resourceToken is 13
var clean_name = replace(replace(name, '-', ''), '_', '')
var storage_prefix = take(clean_name, 8)
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
      name: 'GlobalStandard'
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
          name: 'USE_MANAGED_IDENTITIES'
          value: disableLocalAuth
        }
        
        { 
          name: 'AZURE_KEY_VAULT_NAME'
          value: keyVaultName
        }
        { 
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'AZURE_OPENAI_API_KEY'
          value:  disableLocalAuth ? '' :'@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::AZURE_OPENAI_API_KEY.name})'
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
    principalId: targetUserPrincipal
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
    disableLocalAuth: disableLocalAuth
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
    disableLocalAuth: disableLocalAuth
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
    disableLocalAuth: disableLocalAuth
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
    disableLocalAuth: disableLocalAuth
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
    /*raiPolicyName: contains(deployment, 'raiPolicyName') ? deployment.raiPolicyName : null*/
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
    disableLocalAuth: disableLocalAuth
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



resource speechService 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: speech_service_name
  location: location
  tags: tags
  kind: 'SpeechServices'
  properties: {
    customSubDomainName: speech_service_name
    publicNetworkAccess: 'Enabled'
    /* TODO: disableLocalAuth: disableLocalAuth*/
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
  properties:{
    allowSharedKeyAccess: !disableLocalAuth
  }

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


//RBAC Roles for managed identity authentication

var cosmosDbContributorRoleId = '5bd9cd88-fe45-4216-938b-f97437e15450' // Replace with actual role ID for Cosmos DB.
var cosmosDbOperatorRoleId= '230815da-be43-4aae-9cb4-875f7bd000aa'
var cognitiveServicesContributorRoleId = '25fbc0a9-bd7c-42a3-aa1a-3b75d497ee68' // Replace with actual role ID for Cognitive Services.
var cognitiveServicesUserRoleId='a97b65f3-24c7-4388-baec-2e87135dc908'
var storageBlobDataContributorRoleId = 'ba92f5b4-2d11-453d-a403-e96b0029c9fe' // Replace with actual role ID for Blob Data Contributor.
var searchServiceContributorRoleId = '7ca78c08-252a-4471-8644-bb5ff32d4ba0' // Replace with actual role ID for Azure Search.
var cognitiveServicesOpenAIContributorRoleId='a001fd3d-188f-4b5d-821b-7da978bf7442'
var searchIndexDataContributorRoleId='8ebe5a00-799e-43f5-93ac-243d3dce84a7'

var targetUserPrincipal = webApp.identity.principalId
// These are only deployed if local authentication has been disabled in the parameters

resource cosmosDbRoleAssignment 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = if (disableLocalAuth) {
  name: guid(cosmosDbAccount.id, cosmosDbContributorRoleId, 'role-assignment-cosmosDb')
  scope: cosmosDbAccount
  properties: {
    principalId: targetUserPrincipal
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', cosmosDbContributorRoleId)
  }
}


resource cosmosDbRoleAssignmentOpperator 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = if (disableLocalAuth) {
  name: guid(cosmosDbAccount.id, cosmosDbOperatorRoleId, 'role-assignment-cosmosDb')
  scope: cosmosDbAccount
  properties: {
    principalId: targetUserPrincipal
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', cosmosDbOperatorRoleId)
  }
}

resource cognitiveServicesRoleAssignment 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = if (disableLocalAuth) {
  name: guid(azureopenai.id, cognitiveServicesContributorRoleId, 'role-assignment-cognitiveServices')
  scope: resourceGroup()
  properties: {
    principalId: targetUserPrincipal
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', cognitiveServicesContributorRoleId)
  }
}


resource cognitivbeServicesOpenAIcONTRIBUTORRoleAssignment 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = if (disableLocalAuth) {
  name: guid(azureopenai.id, cognitiveServicesOpenAIContributorRoleId, 'role-assignment-cognitiveServices')
  scope: azureopenai
  properties: {
    principalId: targetUserPrincipal
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', cognitiveServicesOpenAIContributorRoleId)
  }
}

resource  cognitiveServicesUserRoleAssignment 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = if (disableLocalAuth) {
  name: guid(formRecognizer.id, cognitiveServicesUserRoleId, 'role-assignment-cognitiveServices')
  scope:  resourceGroup()
  properties: {
    principalId: targetUserPrincipal
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', cognitiveServicesUserRoleId)
  }
}



resource storageBlobDataContributorRole 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = if (disableLocalAuth) {
  name: guid(storage.id, storageBlobDataContributorRoleId, 'role-assignment-storage')
  scope: storage
  properties: {
    principalId: targetUserPrincipal
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageBlobDataContributorRoleId)
  }
}

resource searchServiceContributorRoleAssignment 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = if (disableLocalAuth) {
  name: guid(searchService.id, searchServiceContributorRoleId, 'role-assignment-searchService')
  scope: searchService
  properties: {
    principalId: targetUserPrincipal
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', searchServiceContributorRoleId)
  }
}
resource searchServiceIndexDataContributorRoleAssignment 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = if (disableLocalAuth) {
  name: guid(searchService.id, searchIndexDataContributorRoleId, 'role-assignment-searchService')
  scope: searchService
  properties: {
    principalId: targetUserPrincipal
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', searchIndexDataContributorRoleId)
  }
}
//Special case for cosmosdb


@description('Name of the role definition.')
param roleDefinitionName string = 'Azure Cosmos DB for NoSQL Data Plane Owner'


resource definition 'Microsoft.DocumentDB/databaseAccounts/sqlRoleDefinitions@2024-05-15'=  if (disableLocalAuth) {
  name: guid(cosmosDbAccount.id, roleDefinitionName)
  parent: cosmosDbAccount
  properties: {
    roleName: roleDefinitionName
    type: 'CustomRole'
    assignableScopes: [
      cosmosDbAccount.id
    ]
    permissions: [
      {
        dataActions: [
          'Microsoft.DocumentDB/databaseAccounts/readMetadata'
          'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/*'
          'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/*'
        ]
      }
    ]
  }
}

resource assignment 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2024-05-15'= if (disableLocalAuth) {
  name: guid(definition.id, webApp.name, cosmosDbAccount.id)
  parent: cosmosDbAccount
  properties: {
    principalId: targetUserPrincipal
    roleDefinitionId: definition.id
    scope: cosmosDbAccount.id
  }

}

output url string = 'https://${webApp.properties.defaultHostName}'
