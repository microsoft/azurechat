# 👨🏻‍💻 Run from your local machine

Clone this repository locally or fork to your Github account. Run all of the the steps below from the "src" directory.
## Prerequisites

- **History Database**: If you didn't [provision the Azure resources](2-provision-azure-resources.md), you **must** at least deploy an instance of Cosmos DB in your Azure Subscription to store chat history.   

- **Identity Provider**: Follow the [instructions](3-run-locally.md) to add one.

## Steps
1. Change directory to the `src` folder
2. Create a new file named `.env.local` to store the environment variables add the following variables.

**Please note:**

- Do not use double-quotes and do not delete any of the variables.
- Make sure that `NEXTAUTH_URL=http://localhost:3000` has no comments in the same line.

  ```bash
  # Azure OpenAI configuration
  AZURE_OPENAI_API_KEY=
  AZURE_OPENAI_API_INSTANCE_NAME=
  AZURE_OPENAI_API_DEPLOYMENT_NAME=
  AZURE_OPENAI_API_VERSION=

  # GitHub OAuth app configuration
  AUTH_GITHUB_ID=
  AUTH_GITHUB_SECRET=

  # Azure AD OAuth app configuration
  AZURE_AD_CLIENT_ID=
  AZURE_AD_CLIENT_SECRET=
  AZURE_AD_TENANT_ID=

  # When deploying to production,
  # set the NEXTAUTH_URL environment variable to the canonical URL of your site.
  # More information: https://next-auth.js.org/configuration/options

  NEXTAUTH_SECRET=
  NEXTAUTH_URL=http://localhost:3000

  AZURE_COSMOSDB_URI=
  AZURE_COSMOSDB_KEY=
  ```

3. Install npm packages by running `npm install`
4. Start the app by running `npm run dev`
5. Access the app on [http://localhost:3000](http://localhost:3000)

You should now be prompted to login with your chosen OAuth provider. Once successfully logged in, you can start creating new conversations.

![Chat Home](/images/chat-home.png)
![Chat history](/images/chat-history.png)

[Next](/docs/4-deployto-azure.md)
