# ☁️ Deploy to Azure

You can provision the required Azure resources in two ways:

## Option 1: Azure Developer CLI (azd)

To deploy the application to Azure using the Azure Developer CLI, follow the steps below. You can do this without cloning the repository, but instructions are also provided for those who have cloned the repository.

1. Download the [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview)

2. **If you have not cloned this repo**:

   1. Run `azd init -t microsoft/azurechat`
   2. Run `azd auth login` to authenticate with Azure
   3. Run `azd up` to provision and deploy the application

3. **If you have cloned this repo**:
   1. Run `azd init` from the repo root directory
   2. Run `azd auth login` to authenticate with Azure
   3. Run `azd up` to provision and deploy the application

In both cases you will be prompted for some configuration values. These are described below:

| Prompt - azd init | Description |
|--------|-------------|
| Enter a new environment name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| The name of the azd environment. The application will be deployed into a resource group called `rg-<environment name>`, and this value is also used in the name of all the created Azure resources.|

| Prompt - azd up | Description |
|--------|-------------|
| Select an Azure Subscription to use| Select the Azure subscription you want to deploy the application to |
|Select an Azure location to use| Select the Azure region you want to deploy the Azure services to. This location is used by all services except OpenAI deployments - these are set separately (below) |
| Enter a value for the 'dalleLocation' infrastructure parameter| Select the Azure region you want to deploy the DALL-E model to. The number of regions that support DALL-E is currently limited |
| Enter a value for the 'disableLocalAuth' infrastructure parameter | Set to `true` to use Managed Identities for authentication, or `false` to use keys. See [Managed Identities](9-managed-identities.md) for more information. if you are unsure we recommend you select `true` |
| Enter a value for the 'openAILocation' infrastructure parameter: | Select the Azure region you want to deploy the OpenAI service to. |
|Enter a value for the 'usePrivateEndpoints' infrastructure parameter: | Set to `false` to deploy the application without Private Endpoints, or `true` to use Private Endpoints. See [Private Endpoints](10-private-endpoints.md) for more information. If you are unsure we recommend you select `false` |


## Option 2: GitHub Actions

The following steps describes how the application can be deployed to Azure App service using GitHub Actions.

### 🧬 Fork the repository

If you haven't already, fork this repository to your own organisation so that you can execute GitHub Actions against your own Azure Subscription. This allows you to edit the code, customise it to your needs, and maintain control over the deployment process.

### 🗝️ Configure secrets in your GitHub repository

#### 1. AZURE_CREDENTIALS

The GitHub workflow requires a secret named `AZURE_CREDENTIALS` to authenticate with Azure. The secret contains the credentials for a Service Principal with the Contributor role on the resource group containing the Azure App Service.

1. Create a Service Principal with the Contributor role on the resource group that contains the Azure App Service.
   ```console
   az ad sp create-for-rbac
      --name <NAME OF THE CREDENTIAL> --role contributor --scopes /subscriptions/<SUBSCRIPTION ID>/resourceGroups/<RESOURCE GROUP> --sdk-auth --output json
   ```
   **⚠️ Deprecation:** You may be presented with a warning that `--sdk-auth` is deprecated and will be removed in future versions. For now, you can ignore this warning or check out [#359](https://github.com/microsoft/azurechat/issues/359#issuecomment-2650632190) for more details.
   
   **💡 Good to know:** The Service Principal secret generated in this step has a default lifespan of 1 year. This can be modified by adding the `--years n` flag to the command above, or generating a new secret for the Service Principal through the Azure Portal. In either case, be sure to update the GitHub secret accordingly.
3. Copy the JSON output from the command.
4. In the GitHub repository, navigate to Settings > Secrets > Actions and select **New repository secret**.
5. Enter `AZURE_CREDENTIALS` as the name and paste the contents of the JSON output as the value.
6. Select **Add secret**.

#### 2. AZURE_APP_SERVICE_NAME

Under the same repository secrets add a new variable `AZURE_APP_SERVICE_NAME` to deploy to your Azure Web app. The value of this secret is the name of your Azure Web app e.g. `my-web-app-name` from the domain https://my-web-app-name.azurewebsites.net/

#### 3. Run GitHub Actions

Once the secrets are configured, the GitHub Actions will be triggered for every code push to the repository. Alternatively, you can manually run the workflow by clicking on the "Run Workflow" button in the Actions tab of your GitHub repository.

![Workflow screenshot](/docs/images/runworkflow.png)

## Continue to the next step...

👉 [Next: Chatting with your file](./5-chat-over-file.md)
