# 🪪 Add an Identity Provider

Once the deployment is complete, you will need to add an identity provider to authenticate your app. You will also need to configure an admin user.

> [!NOTE]
> Only one of the identity providers is required to be configured below.

> [!IMPORTANT]
> We **strongly** recommend that you store client secrets in Azure Key Vault and use Kev Vault references in your App config settings. If you have created your environment using the templates in this repo you will already have a Key Vault that is being used to store a range of other secrets, and you will have Key Vault references in your app config. Details on how to configure App Service settings to use Key Vault are [here](https://learn.microsoft.com/en-us/azure/app-service/app-service-key-vault-references?tabs=azure-cli#source-app-settings-from-key-vault). Note that you will also need to give yourself appropriate permissions to create secrets in the Key Vault.

## GitHub Authentication Provider

We'll create two GitHub apps: one for testing locally and another for production.

### 🟡 Development App Setup

1. Navigate to GitHub OAuth Apps setup https://github.com/settings/developers
2. Create a `New OAuth App` https://github.com/settings/applications/new
3. Fill in the following details

   ```default
   Application name:  DEV Environment
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```

### 🟢 Production App Setup

1. Navigate to GitHub OAuth Apps setup https://github.com/settings/developers
2. Create a `New OAuth App` https://github.com/settings/applications/new
3. Fill in the following details

   ```default
   Application name:  Production
   Homepage URL: https://YOUR-WEBSITE-NAME.azurewebsites.net
   Authorization callback URL: https://YOUR-WEBSITE-NAME.azurewebsites.net/api/auth/callback/github
   ```

> [!NOTE]
> After completing app setup, ensure that both your local environment variables as well as Azure Web App environment variables are up to date.

```bash
   # GitHub OAuth app configuration
   AUTH_GITHUB_ID=
   AUTH_GITHUB_SECRET=
```

## Azure AD Authentication Provider

### 🟡 Development App Setup

1. Navigate to [Azure AD Apps setup](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps)
2. Create a [New Registration](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/CreateApplicationBlade/quickStartType~/null/isMSAApp~/false)
3. Fill in the following details

   ```default
   Application name: DEV Environment
   Supported account types: Accounts in this organizational directory only
   Redirect URI Platform: Web
   Redirect URI: http://localhost:3000/api/auth/callback/azure-ad
   ```

### 🟢 Production App Setup

1. Navigate to [Azure AD Apps setup](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps)
2. Create a [New Registration](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/CreateApplicationBlade/quickStartType~/null/isMSAApp~/false)
3. Fill in the following details

   ```default
   Application name: Production
   Supported account types: Accounts in this organizational directory only
   Redirect URI Platform: Web
   Redirect URI: https://YOUR-WEBSITE-NAME.azurewebsites.net/api/auth/callback/azure-ad
   ```

> [!NOTE]
> After completing app setup, ensure your environment variables locally and on Azure App Service are up to date.

```bash
# Azure AD OAuth app configuration

AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=
```

## Configure an admin user

The reporting pages in the application are only available to an admin user. To configure the admin user create or update the `ADMIN_EMAIL_ADDRESS` config setting locally and on Azure App Service with the email address of the user who will use reports.

[Next](/docs/6-chat-over-file.md)
