# 🪪 Add an identity provider

Once the deployment is complete, you will need to add an identity provider to authenticate your app.

⚠️ Note: Only one of the identity provider is required below.

# GitHub Authentication provider

We'll create two GitHub apps: one for testing locally and another for production.

#### 🟡 Development app setup

1. Navigate to GitHub OAuth Apps setup https://github.com/settings/developers
2. Create a `New OAuth App` https://github.com/settings/applications/new
3. Fill in the following details

```
Application name: ChatGPT on Azure solution accelerator DEV Environment
Homepage URL: http://localhost:3000
Authorization callback URL: http://localhost:3000/api/auth/callback/github
```

#### 🟢 Production app setup

1. Navigate to GitHub OAuth Apps setup https://github.com/settings/developers
2. Create a `New OAuth App` https://github.com/settings/applications/new
3. Fill in the following details

```
Application name: ChatGPT on Azure solution accelerator Production
Homepage URL: https://YOUR-WEBSITE-NAME.azurewebsites.net
Authorization callback URL: https://YOUR-WEBSITE-NAME.azurewebsites.net/api/auth/callback/github
```

⚠️ After completing app setup, ensure your environment variables locally and on Azure App Service are up to date.

```
   # GitHub OAuth app configuration
   AUTH_GITHUB_ID=
   AUTH_GITHUB_SECRET=
```

# Azure AD Authentication provider

#### 🟡 Development app setup

1. Navigate to Azure AD Apps setup https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps
2. Create a `New Registration` https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/CreateApplicationBlade/quickStartType~/null/isMSAApp~/false
3. Fill in the following details

```
Application name: ChatGPT on Azure solution accelerator DEV Environment
Supported account types: Accounts in this organizational directory only
Redirect URI Platform: Web
Redirect URI: http://localhost:3000/api/auth/callback/azure-ad
```

#### 🟢 Production app setup

1. Navigate to Azure AD Apps setup https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps
2. Create a `New Registration` https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/CreateApplicationBlade/quickStartType~/null/isMSAApp~/false
3. Fill in the following details

```
Application name: ChatGPT on Azure solution accelerator Production
Supported account types: Accounts in this organizational directory only
Redirect URI Platform: Web
Redirect URI: https://YOUR-WEBSITE-NAME.azurewebsites.net/api/auth/callback/azure-ad
```

⚠️ After completing app setup, ensure your environment variables locally and on Azure App Service are up to date.

```
# Azure AD OAuth app configuration

AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=
```

[Next](/docs/6-chat-over-file.md)
