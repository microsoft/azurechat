# Provision Azure resources

You can provision Azure resources for AzureChat using one of two methods described below.

### Azure Developer CLI

⚠️ This section will create Azure resources and deploy the solution from your local environment using the Azure Developer CLI. ⚠️

1. Download the [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview)
1. Run `azd init -t microsoft/azurechat`
1. Run `azd up` to provision and deploy the application
1. Values required are described in the [Environment variables](./7-environment-variables.md) section.

### Deploy to Azure

⚠️ This will only create azure resources. Follow the [deploy to Azure section](./4-deployto-azure.md) to build and deploy AzureChat using GitHub actions. ⚠️

Click on the Deploy to Azure button and configure your settings in the Azure Portal as described in the [Environment variables](./7-environment-variables.md) section.

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://aka.ms/anzappazurechatgpt)

# Setup Authentication

🚨 AzureChat is protected by an identity provider and follow the steps in [Add an identity provider
](./5-add-Identity.md) section for adding authentication to your app.

[Next](/docs/3-run-locally.md)
