@minLength(1)
@description('Primary location for all resources')
param location string

param name string
param resourceToken string

param cosmos_id string
param openai_id string
param openai_dalle_id string
param form_recognizer_id string
param speech_service_id string
param search_service_id string
param storage_id string
param keyVault_id string

param tags object

var subnetNamePrivateEndpoints = 'privateEndpoints'
var subnetNameAppServiceBackend = 'appServiceBackend'

var virtualNetworkName = toLower('${name}-vnet-${resourceToken}')

var privateEndpointSpecs = [
  {
    serviceId: cosmos_id
    dnsZoneName: 'privatelink.documents.azure.com'
    groupId: 'Sql'
  }
  {
    serviceId: openai_id
    dnsZoneName: 'privatelink.openai.azure.com'
    groupId: 'account'
  }
  {
    serviceId: storage_id
    dnsZoneName: 'privatelink.blob.core.windows.net'
    groupId: 'blob'
  }
  {
    serviceId: search_service_id
    dnsZoneName: 'privatelink.search.windows.net'
    groupId: 'searchService'
  }
  {
    serviceId: keyVault_id
    dnsZoneName: 'privatelink.vaultcore.azure.net'
    groupId: 'vault'
  }
  {
    serviceId: form_recognizer_id
    dnsZoneName: 'privatelink.cognitiveservices.azure.com'
    groupId: 'account'
  }
  // speech service is called from the browser so no private endpoint
  // {
  //   serviceId: speech_service_id
  //   dnsZoneName: 'privatelink.cognitiveservices.azure.com'
  //   groupId: 'account'
  // }
]

// specified separately so that we can ensure the private DNS zones are created before these private endpoints
var privateEndpointSpecs_noDNSZone = [
  {
    serviceId: openai_dalle_id
    dnsZoneName: 'privatelink.openai.azure.com'
    groupId: 'account'
  }
]

resource virtualNetwork 'Microsoft.Network/VirtualNetworks@2021-08-01' = {
  name: virtualNetworkName
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: [
        '192.168.0.0/16'
      ]
    }
  }
}

resource subnet_privateEndpoint 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' = {
  parent: virtualNetwork
  name: subnetNamePrivateEndpoints
  properties: {
    addressPrefix: '192.168.0.0/24'
    privateEndpointNetworkPolicies: 'Disabled'
  }
}

resource subnet_appServiceBackend 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' = {
  parent: virtualNetwork
  name: subnetNameAppServiceBackend
  properties: {
    addressPrefix: '192.168.1.0/24'
    delegations: [
      {
        name: 'delegation'
        properties: {
          serviceName: 'Microsoft.Web/serverFarms'
        }
      }
    ]
  }
}

module privateEndpoints 'private_endpoints_services.bicep' = [
  for (privateEndpointSpec, i) in privateEndpointSpecs: {
    name: 'private-endpoint-${i}'
    params: {
      serviceId: privateEndpointSpec.serviceId
      dnsZoneName: privateEndpointSpec.dnsZoneName
      createDnsZone: true
      virtualNetworkId: virtualNetwork.id
      privateEndpointSubnetId: subnet_privateEndpoint.id
      groupId: privateEndpointSpec.groupId
    }
  }
]

// created after the previous private endpoints to ensure the private DNS zones are created first
module privateEndpoints_noDNSZone 'private_endpoints_services.bicep' = [
  for (privateEndpointSpec, i) in privateEndpointSpecs_noDNSZone: {
    name: 'private-endpoint-noDns-${i}'
    dependsOn: [
      privateEndpoints
    ]
    params: {
      serviceId: privateEndpointSpec.serviceId
      dnsZoneName: privateEndpointSpec.dnsZoneName
      createDnsZone: false
      virtualNetworkId: virtualNetwork.id
      privateEndpointSubnetId: subnet_privateEndpoint.id
      groupId: privateEndpointSpec.groupId
    }
  }
] 

output appServiceSubnetId string = subnet_appServiceBackend.id
