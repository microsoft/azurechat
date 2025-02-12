# ☁️ Deploy to Azure - Azure Developer CLI (azd)

To deploy the application to Azure using the Azure Developer CLI, follow the steps below.

> [!IMPORTANT]
> This section will create Azure resources and deploy the solution from your local environment using the Azure Developer CLI. Note that you do not need to clone this repo to complete these steps.

1. Download the [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview)
1. If you have not cloned this repo, run `azd init -t microsoft/azurechat`. If you have cloned this repo, just run 'azd init' from the repo root directory.
1. Run `azd up` to provision and deploy the application

```pwsh
azd init -t microsoft/azurechat
azd up

# if you have already cloned the repo
azd up

# if you are wanting to see logs run with debug flag
azd up --debug
```

# ☁️ Deploy to Azure - GitHub Actions

The following steps describes how the application can be deployed to Azure App service using GitHub Actions.

## 🧬 Fork the repository

If you haven't already, fork this repository to your own organisation so that you can execute GitHub Actions against your own Azure Subscription. This allows you to edit the code, customise it to your needs, and maintain control over the deployment process.

## 🗝️ Configure secrets in your GitHub repository

### 1. AZURE_CREDENTIALS

The GitHub workflow requires a secret named `AZURE_CREDENTIALS` to authenticate with Azure. The secret contains the credentials for a service principal with the Contributor role on the resource group containing the container app and container registry.

1. Create a service principal with the Contributor role on the resource group that contains the Azure App Service.

   ```console
   az ad sp create-for-rbac
      --name <NAME OF THE CREDENTIAL> --role contributor --scopes /subscriptions/<SUBSCRIPTION ID>/resourceGroups/<RESOURCE GROUP> --sdk-auth --output json
   ```

2. Copy the JSON output from the command.

3. In the GitHub repository, navigate to Settings > Secrets > Actions and select **New repository secret**.

4. Enter `AZURE_CREDENTIALS` as the name and paste the contents of the JSON output as the value.

5. Select **Add secret**.

### 2. AZURE_APP_SERVICE_NAME

Under the same repository secrets add a new variable `AZURE_APP_SERVICE_NAME` to deploy to your Azure Web app. The value of this secret is the name of your Azure Web app e.g. `my-web-app-name` from the domain https://my-web-app-name.azurewebsites.net/

### 3. Run GitHub Actions

Once the secrets are configured, the GitHub Actions will be triggered for every code push to the repository. Alternatively, you can manually run the workflow by clicking on the "Run Workflow" button in the Actions tab of your GitHub repository.

![Workflow screenshot](/docs/images/runworkflow.png)

## Continue to the next step...

👉 [Next: Chatting with your file](./5-chat-over-file.md)
