# Deploy to Azure

You can provision Azure resources for the solution accelerator using either the Azure Developer CLI or the Deploy to Azure button below. Regardless of the method you chose you will still need set up an [identity provider and specify an admin user](/docs/5-add-identity.md)

## Deployment Options

You can deploy the application using one of the following options:

- [1. Azure Developer CLI](#azure-developer-cli)
- [2. Azure Portal Deployment](#azure-portal-deployment)

### 1. Azure Developer CLI

> [!IMPORTANT]
> This section will create Azure resources and deploy the solution from your local environment using the Azure Developer CLI. Note that you do not need to clone this repo to complete these steps.

1. Download the [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview)
1. If you have not cloned this repo, run `azd init -t microsoft/azurechat`. If you have cloned this repo, just run 'azd init' from the repo root directory.
1. Run `azd up` to provision and deploy the application

```pwsh
azd init -t microsoft/azurechat
azd up

# if you are wanting to see logs run with debug flag
azd up --debug
```

### 2. Azure Portal Deployment

> [!WARNING]
> This button will only create Azure resources. You will still need to deploy the application by following the [deploy to Azure section](/docs/4-deploy-to-azure.md) to build and deploy the application using GitHub actions.

Click on the Deploy to Azure button to deploy the Azure resources for the application.

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://aka.ms/anzappazurechatgpt)

> [!IMPORTANT]
> The application is protected by an identity provider and follow the steps in [Add an identity provider](/docs/5-add-identity.md) section for adding authentication to your app.

[Next](3-run-locally.md)
