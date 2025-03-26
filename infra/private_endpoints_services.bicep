param serviceId string

param dnsZoneName string
param createDnsZone bool = true
param virtualNetworkId string
param privateEndpointSubnetId string
param groupId string

var idElements = split(serviceId, '/')
var idElementsLength = length(idElements)

var serviceName = idElementsLength == 1 ? serviceId : idElements[idElementsLength-1]

resource privateEndpoint 'Microsoft.Network/privateEndpoints@2021-08-01' = {
  name: toLower('${serviceName}-pe')
  location: resourceGroup().location
  properties: {
    subnet: {
      id: privateEndpointSubnetId
    }
    privateLinkServiceConnections: [
      {
        name: toLower('${serviceName}-pe-connections')
        properties: {
          privateLinkServiceId: serviceId
          groupIds: [
            groupId
          ]
        }
      }
    ]
  }
}

resource privateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = if (createDnsZone) {
  name: dnsZoneName
  location: 'global'
}

resource privateDnsZoneLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = if (createDnsZone){
  parent: privateDnsZone
  name: '${privateDnsZone.name}-link'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: virtualNetworkId
    }
  }
}

resource privateEndpointsDnsZoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2023-05-01' = {
  name: '${serviceName}-dns-zone-group'
  parent: privateEndpoint
  properties: {
    privateDnsZoneConfigs: [
      {
        name: dnsZoneName
        properties: {
          privateDnsZoneId: resourceId('Microsoft.Network/privateDnsZones', dnsZoneName)
        }
      }
    ]
  }
}
