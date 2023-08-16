# Provision Azure resources

You can provision Azure resources for AzureChat using one of two methods described below.

⚠️ Note: This will only create azure resources. Follow the [deploy to Azure section](#-deploy-to-azure---github-actions) to build and deploy AzureChat.

Please also see [section 5](./5-add-Identity.md) for important information about adding authentication to your app.

### Azure Developer CLI

1. Download the [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview)
1. Run `azd init -t microsoft/azurechat`
1. Run `azd up` to provision and deploy the application
1. Values required are described in the [Environment variables](#-environment-variables) section.

### Deploy to Azure

Click on the Deploy to Azure button and configure your settings in the Azure Portal as described in the [Environment variables](#-environment-variables) section.

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://aka.ms/anzappazurechatgpt)


[Next](/docs/3-run-locally.md)
