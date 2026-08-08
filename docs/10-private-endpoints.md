# Securing Azure Chat Resources with Private Endpoints

## Overview

You can enhance the security of the Azure Chat application by using Private Endpoints. Private Endpoints provide a secure and private connection to Azure services, ensuring that traffic between the Web App that hosts the application and the supporting Azure services remains within the Microsoft network. Implementing Private Endpoints also allows for the removal of any public network access to the these services.

The included bicep template can optionally be configured to make a number of key changes to the deployed Azure resources to enable Private Endpoints:
1. Deploy a Virtual Network and 2 subnets - one for the Web App backend, and one for the Private Endpoints.
1. Deploy Private Endpoints for the following services:
   - OpenAI Service
   - Cosmos DB
   - Storage Account
   - AI Search Service
   - AI Document Intelligence
   - Key Vault
1. Configure the Web App to use the Virtual Network for outgoing requests
1. Remove public access to all of the above services - only clients and applications within the Virtual Network will be able to access these services.

![Private Endpoints image](/docs/images/private-endpoints.png)

Using Private Endpoints for these services is a recommended best practice for production deployments of Azure Chat, and it can also be useful in Azure environments where policies are in place to disable public access to some services. There are some additional considerations to be aware of when using Private Endpoints however:
- **Local Developemnt**: If you deploy the Azure resources with Private Endpoints it will be more difficult to use these services if you are running the application locally - you will need to use a development environment that is connected to the Virtual Network.
- **Resource Access in the Portal** - If you deploy the Azure resources with Private Endpoints you will need to use a development environment that is connected to the Virtual Network to access the data plane for any of these services (e.g. the Cosmos DB Azure Portal Data Explorer). 

## How to enable Private Endpoints

The addition of Private Endpoints and it's supportted configuration is controlled by the `usePrivateEndpoints` parameter in the bicep template. To enable Private Endpoints, set this parameter to `true`. If you are using the Azure Developer CLI to deploy the application see the [Deploy to Azure](4-deploy-to-azure.md) page for more details on how to do this. 

## Additional Configuration

By default the Virtual Network that is deployed when you set `usePrivateEndpoints` to `true` has the following properies:
- **Address Space**:  `192.168.0.0/16`
- **Subnet for Private Endpoints**: `privateEndpoints` - `192.168.0.0/24`
- **Subnet for Web App**: `appServiceBackend` - `192.168.1.0/24`

The address spaces for each of the subnets can be changed by setting the `privateEndpointVNetPrefix`, `privateEndpointSubnetAddressPrefix` and `appServiceBackendSubnetAddressPrefix` parameters in the bicep template.

If you want to deploy these resources into an existing Virtual Network you will need to modify the `private_endpoints_core.bicep` template - a parameterised version of this is not currently available. If you do this note that the deployment includes Private DNS Zones for each of the services that are deployed with Private Endpoints - if your Virtual Network uses a custom DNS server you will need to ensure that the DNS server can resolve the Private DNS Zones.


