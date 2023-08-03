# Unleash the Power of Azure Open AI

ChatGPT has grown explosively in popularity as we all know now. Business users across the globe often tap into the public service to work more productively or act as a creative assistant.

However, ChatGPT risks exposing confidential intellectual property. One option is to block corporate access to ChatGPT, but people always find workarounds. This also limits the powerful capabilities of ChatGPT and reduces employee productivity and their work experience.

Azure ChatGPT is our enterprise option. This is the exact same service but offered as your private ChatGPT.

### Benefits are:

**1. Private:** Built-in guarantees around the privacy of your data and fully isolated from those operated by OpenAI.

**2. Controlled:** Network traffic can be fully isolated to your network and other enterprise grade security controls are built in.

**3. Value:** Deliver added business value with your own internal data sources (plug and play) or use plug-ins to integrate with your internal services (e.g., ServiceNow, etc).

We've built a Solution Accelerator to empower your workforce with Azure ChatGPT.

![](/images/intro.png)

# 📘 Prerequisites

1. [Azure OpenAI](https://azure.microsoft.com/en-us/products/cognitive-services/openai-service/): To deploy and run ChatGPT on Azure, you'll need an Azure subscription with access to the Azure OpenAI service. Request access [here](https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR7en2Ais5pxKtso_Pz4b1_xUOFA5Qk1UWDRBMjg0WFhPMkIzTzhKQ1dWNyQlQCN0PWcu). Once you have access, follow the instructions in this [link](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/how-to/create-resource?pivots=web-portal) to deploy the gpt-35-turbo or gpt-4 models.

2. Setup GitHub or Azure AD for Authentication:
   The [add an identity provider](https://github.com/oliverlabs/azurechatgpt#-add-an-identity-provider) section below shows how to configure authentication providers.

   💡Note: You can configure the authentication provider to your identity solution using [NextAuth providers](https://next-auth.js.org/providers/)

# 👋🏻 Introduction

Azure ChatGPT is built with the following technologies.

[Node.js 18](https://nodejs.org/en): an open-source, cross-platform JavaScript runtime environment.

[Next.js 13](https://nextjs.org/docs): enables you to create full-stack web applications by extending the latest React features

[NextAuth.js](https://next-auth.js.org/): configurable authentication framework for Next.js 13

[LangChain JS](https://www.langchain.com/): AI orchestration layer to build intelligent apps

[Tailwind CSS](https://tailwindcss.com/): is a utility-first CSS framework that provides a series of predefined classes that can be used to style each element by mixing and matching

[shadcn/ui](https://ui.shadcn.com/): re-usable components built using Radix UI and Tailwind CSS.

[Azure Cosmos DB](https://learn.microsoft.com/en-GB/azure/cosmos-db/nosql/): fully managed platform-as-a-service (PaaS) NoSQL database to store chat history

[Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/): fully managed platform-as-a-service (PaaS) for hosting web applications, REST APIs, and mobile back ends.

![](/images/architecture.png)

# 💙 One click Azure deployment

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://aka.ms/anzappazurechatgpt)

Click on the Deploy to Azure button and configure your settings in the Azure Portal as described in the [Environment variables](#🔑-environment-variables) section.

Please see the [section below](#🪪-add-an-identity-provider) for important information about adding authentication to your app.

# 👨🏻‍💻 Run from your local machine

Clone this repository locally or fork to your Github account. Run all of the the steps below from the "src" directory.

1. Create a new file named `.env.local` to store the environment variables add the following variables

   ```
   - azure-open-ai-accelerator
   # azure open ai related configurations
   AZURE_OPENAI_API_KEY=
   AZURE_OPENAI_API_INSTANCE_NAME=
   AZURE_OPENAI_API_DEPLOYMENT_NAME=
   AZURE_OPENAI_API_VERSION=

   # github OAuth app configuration
   AUTH_GITHUB_ID=
   AUTH_GITHUB_SECRET=

   # Azure AD OAuth app configuration
   AZURE_AD_CLIENT_ID=
   AZURE_AD_CLIENT_SECRET=
   AZURE_AD_TENANT_ID=

   # when deploying to production, set the NEXTAUTH_URL environment variable to the canonical URL of your site. https://next-auth.js.org/configuration/options

   NEXTAUTH_SECRET=
   NEXTAUTH_URL=http://localhost:3000

   AZURE_COSMOSEDB_URI=
   AZURE_COSMOSEDB_KEY=
   ```

2. Install npm packages by running `npm install`
3. Start the project by running `npm run dev`

You should now be prompted to login with GitHub. Once you successfully login, you can start creating new conversations.

![](/images/chat-home.png)
![](/images/chat-history.png)

# ☁️ Deploy to Azure - GitHub Actions

### 🧬 Fork the repository

Fork this repository to your own organisation so that you can execute GitHub Actions against your own Azure Subscription.

### 🗝️ Configure secrets in your GitHub repository

### 1. AZURE_CREDENTIALS

The GitHub workflow requires a secret named AZURE_CREDENTIALS to authenticate with Azure. The secret contains the credentials for a service principal with the Contributor role on the resource group containing the container app and container registry.

1. Create a service principal with the Contributor role on the resource group that contains the Azure App Service.

   ```
   az ad sp create-for-rbac
      --name <NAME OF THE CREDENTIAL> --role contributor --scopes /subscriptions/<SUBSCRIPTION ID>/resourceGroups/<RESOURCE GROUP> --sdk-auth --output json
   ```

2. Copy the JSON output from the command.

3. In the GitHub repository, navigate to Settings > Secrets > Actions and select New repository secret.

4. Enter AZURE_CREDENTIALS as the name and paste the contents of the JSON output as the value.

5. Select Add secret.

### 2. AZURE_APP_SERVICE_NAME

Under the same repository secrets add a new variable `AZURE_APP_SERVICE_NAME` to deploy to your Azure Web app. The value of this secret is the name of your Azure Web app e.g. `my-web-app-name` from the domain https://my-web-app-name.azurewebsites.net/

### 🔄 Run GitHub Actions

Once the secrets are configured, the GitHub Actions will be triggered for every code push to the repository. Alternatively, you can manually run the workflow by clicking on the "Run Workflow" button.

![](./images/runworkflow.png)

# 🪪 Add an identity provider

Once the deployment is complete, you will need to add an identity provider to authenticate your app.

⚠️ Note: Only one of the identity provider is required below.

## GitHub Authentication provider

We'll create two GitHub apps: one for testing locally and another for production.

### 🟡 Development app setup

1. Navigate to GitHub OAuth Apps setup https://github.com/settings/developers
2. Create a `New OAuth App` https://github.com/settings/applications/new
3. Fill in the following details

```
Application name: Azure ChatGPT DEV Environment
Homepage URL:http://localhost:3000/
Authorization callback URL:http://localhost:3000/api/auth/callback/github/
```

### 🟢 Production app setup

1. Navigate to GitHub OAuth Apps setup https://github.com/settings/developers
2. Create a `New OAuth App` https://github.com/settings/applications/new
3. Fill in the following details

```
Application name: Azure ChatGPT Production
Homepage URL:https://YOUR-WEBSITE-NAME.azurewebsites.net/
Authorization callback URL:https://YOUR-WEBSITE-NAME.azurewebsites.net/api/auth/callback/github/
```

⚠️ Once the apps are setup, ensure to update the environment variables locally and on Azure App Service.

```
   # github OAuth app configuration
   AUTH_GITHUB_ID=
   AUTH_GITHUB_SECRET=
```

## Azure AD Authentication provider

### 🟡 Development app setup

1. Navigate to Azure AD Apps setup https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps
2. Create a `New Registration` https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/CreateApplicationBlade/quickStartType~/null/isMSAApp~/false
3. Fill in the following details

```
Application name: Azure ChatGPT DEV Environment
Supported account types: Accounts in this organizational directory only
Redirect URI Platform: Web
Redirect URI:http://localhost:3000/api/auth/callback/azure-ad
```

### 🟢 Production app setup

1. Navigate to Azure AD Apps setup https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps
2. Create a `New Registration` https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/CreateApplicationBlade/quickStartType~/null/isMSAApp~/false
3. Fill in the following details

```
Application name: Azure ChatGPT Production
Supported account types: Accounts in this organizational directory only
Redirect URI Platform: Web
Redirect URI:https://YOUR-WEBSITE-NAME.azurewebsites.net/api/auth/callback/azure-ad
```

⚠️ Once the apps are setup, ensure to update the environment variables locally and on Azure App Service.

```
# Azure AD OAuth app configuration

AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=
```

# 🔑 Environment variables

Below are the required environment variables

| App Setting                      | Value              | Note                                                                                                                                   |
| -------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| AZURE_OPENAI_API_KEY             |                    | API keys of your Azure OpenAI resource                                                                                                 |
| AZURE_OPENAI_API_INSTANCE_NAME   |                    | the name of your Azure OpenAI resource                                                                                                 |
| AZURE_OPENAI_API_DEPLOYMENT_NAME |                    | The name of your model deployment                                                                                                      |
| AZURE_OPENAI_API_VERSION         | 2023-03-15-preview | API version when using gpt chat                                                                                                        |
| AUTH_GITHUB_ID                   |                    | Client ID of your GitHub OAuth application                                                                                             |
| AUTH_GITHUB_SECRET               |                    | Client Secret of your GitHub OAuth application                                                                                         |
| NEXTAUTH_SECRET                  |                    | Used to encrypt the NextAuth.js JWT, and to hash email verification tokens. **This set by default as part of the deployment template** |
| NEXTAUTH_URL                     |                    | Current webs hosting domain name with HTTP or HTTPS. **This set by default as part of the deployment template** qweqweqwe              |
| AZURE_COSMOSEDB_URI              |                    | URL of the Azure CosmosDB                                                                                                              |
| AZURE_COSMOSEDB_KEY              |                    | API Key for Azure Cosmos DB                                                                                                            |
| AZURE_AD_CLIENT_ID               |                    | The client id specific to the application                                                                                              |
| AZURE_AD_CLIENT_SECRET           |                    | The client secret specific to the application                                                                                          |
| AZURE_AD_TENANT_ID               |                    | The organisation Tenant ID                                                                                                             |

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
