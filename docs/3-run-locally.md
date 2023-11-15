# 👨🏻‍💻 Run Locally

Clone this repository locally or fork to your Github account. Run all of the the steps below from the `src` directory.

## Prerequisites

- **History Database**: If you didn't [provision the Azure resources](2-provision-azure-resources.md), you **must** at least deploy an instance of Cosmos DB in your Azure Subscription to store chat history.

- **Identity Provider**: For local development, you have the option of using a username / password. If you prefer to use an Identity Provider, follow the [instructions](3-run-locally.md) to add one.

## Steps

1. Change directory to the `src` folder
2. Copy the file `.env.example` and rename it to `.env.local`.
3. Populate the environment variables in this file.
    <details><summary>Environment Variables (ref src/.env.example)</summary>
     
     ```bash
     # NOTES: 
     # - Do not use double-quotes and do not delete any of the variables.
     # - Make sure that NEXTAUTH_URL=http://localhost:3000 has no comments in the same line.

   # Update your Azure OpenAI details

   # AZURE_OPENAI_API_INSTANCE_NAME should be just the name of azure openai resource and not the full url;

   # AZURE_OPENAI_API_DEPLOYMENT_NAME should be deployment name from your azure openai studio and not the model name.

   # AZURE_OPENAI_API_VERSION should be Supported versions checkout docs https://learn.microsoft.com/en-us/azure/ai-services/openai/reference

   OPENAI_API_KEY=
   AZURE_OPENAI_API_INSTANCE_NAME=
   AZURE_OPENAI_API_DEPLOYMENT_NAME=
   AZURE_OPENAI_API_VERSION=2023-03-15-preview
   AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME=

   # Update your admin email address

   ADMIN_EMAIL_ADDRESS="you@email.com,you2@email.com"

   # You must have atleast one of the following auth providers configured

   AUTH_GITHUB_ID=
   AUTH_GITHUB_SECRET=
   AZURE_AD_CLIENT_ID=
   AZURE_AD_CLIENT_SECRET=
   AZURE_AD_TENANT_ID=

   # Update your production URL in NEXTAUTH_URL

   NEXTAUTH_SECRET=AZURE-OPENIAI-NEXTAUTH-OWNKEY@1
   NEXTAUTH_URL=http://localhost:3000

   # Update your Cosmos Environment details here

   AZURE_COSMOSDB_URI=https://<cosmoresourcename>.documents.azure.com:443/
   AZURE_COSMOSDB_KEY=

   # Update your Cosmos DB_NAME and CONTAINER_NAME if you want to overwrite the default values

   AZURE_COSMOSDB_DB_NAME=chat
   AZURE_COSMOSDB_CONTAINER_NAME=history

   # Azure cognitive search is used for chat over your data

   AZURE_SEARCH_API_KEY=
   AZURE_SEARCH_NAME=
   AZURE_SEARCH_INDEX_NAME=
   AZURE_SEARCH_API_VERSION="2023-07-01-Preview"

   # Azure AI Document Intelligence to extract content from your data

   AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT="https://REGION.api.cognitive.microsoft.com/"
   AZURE_DOCUMENT_INTELLIGENCE_KEY=

   # Azure Speech to Text to convert audio to text

   # Enabled must be set to "true" any other value will disable the feature

   PUBLIC_SPEECH_ENABLED=true
   AZURE_SPEECH_REGION=<region, e.g. australiaeast>
   AZURE_SPEECH_KEY=

   ```
   </details>

   ```

4. Install npm packages by running `npm install`
5. Start the app by running `npm run dev`
6. Access the app on [http://localhost:3000](http://localhost:3000)

You should now be prompted to login with your chosen OAuth provider.

> NOTE: If using Basic Auth (DEV ONLY) any username you enter will create a new user id (hash of username@localhost). You can use this to simulate multiple users.

![Chat Login (DEV)](/images/chat-login-dev.png)

Once successfully logged in, you can start creating new conversations.

![Chat Home](/images/chat-home.png)
![Chat history](/images/chat-history.png)

[Next](/docs/4-deploy-to-azure.md)
