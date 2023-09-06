# Getting Started

You can provision Azure resources for AzureChat using either the Azure Developer CLI or the Deploy to Azure button below. Regardless of the method you chose you will still need set up an [identity provider and specify an admin user](./5-add-identity.md)

## Deployment Options

You can deploy AzureChat using one of the following options:

- [Azure Developer CLI](#azure-developer-cli)
- [Azure Portal Deployment](#azure-portal-deployment)

### Azure Developer CLI

> **Important**
> This section will create Azure resources and deploy the solution from your local environment using the Azure Developer CLI. Note that you do not need to clone this repo to complete these steps.

1. Download the [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview)
1. Run `azd init -t microsoft/azurechat`
1. Run `azd up` to provision and deploy the application

### Azure Portal Deployment

> **Warning**
> This button will only create Azure resources. You will still need to deploy the application by following the [deploy to Azure section](./4-deploy-to-azure.md) to build and deploy AzureChat using GitHub actions.

Click on the Deploy to Azure button to deploy the Azure resources for the application.

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://aka.ms/anzappazurechatgpt)

## Setup Authentication

> **Important**
> AzureChat is protected by an identity provider and follow the steps in [Add an identity provider](./5-add-identity.md) section for adding authentication to your app.

[Next](/docs/3-run-locally.md)
