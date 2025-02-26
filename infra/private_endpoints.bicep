@minLength(1)
@description('Primary location for all resources')
param location string

param name string
param resourceToken string

param cosmosServiceId string
param openAiServiceId string
param dalleServiceId string
param formRecognizerServiceId string
param speechServiceId string
param storageAccountId string

param tags object 

var subnetNamePrivateEndpoints = 'privateEndpoints'
var subnetNameAppServiceBackend = 'appServiceBackend'

var virtualNetworkName = toLower('${name}-vnet-${resourceToken}')
  
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

resource privateEndpoint_cosmos 'Microsoft.Network/privateEndpoints@2021-08-01' = {
  name: toLower('${name}-pe-cosmos-${resourceToken}')
  location: location
  properties: {
    subnet: {
      id: subnet_privateEndpoint.id
    }
    privateLinkServiceConnections: [
      {
        name: 'cosmos-connection'
        properties: {
          privateLinkServiceId: cosmosServiceId
          groupIds: [
            'Sql'
          ]
        }
      }
    ]
  }
}

resource privateDns_cosmos 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: 'privatelink.documents.azure.com'
  location: 'global'
}

resource privateDns_ZoneLink_Cosmos 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  parent: privateDns_cosmos
  name: '${privateDns_cosmos.name}-link'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: virtualNetwork.id
    }
  }
}

resource privateEndpoints_DNS_cosmos 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2023-05-01' = {
  name: 'privateEndpoints_DNS_cosmos'
  parent: privateEndpoint_cosmos
  properties: {
    privateDnsZoneConfigs: [
      {
        name: privateDns_cosmos.name
        properties: {
          privateDnsZoneId: privateDns_cosmos.id
        }
      }
    ]
  }
}

output appServiceSubnetId string = subnet_appServiceBackend.id
