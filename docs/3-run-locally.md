# 👨🏻‍💻 Run Locally

Clone this repository locally or fork to your Github account. Run all of the the steps below from the `src` directory.

## Prerequisites

- **History Database**: If you didn't [provision the Azure resources](2-provision-azure-resources.md), you **must** at least deploy an instance of Cosmos DB in your Azure Subscription to store chat history.

- **Identity Provider**: For local development, you have the option of using a username / password. If you prefer to use an Identity Provider, follow the [instructions](3-run-locally.md) to add one.

## Steps

1. Change directory to the `src` folder
2. Rename the file `.env.example` to `.env.local` and populate the environment variables based on the deployed resources in Azure.
3. Install npm packages by running `npm install`
4. Start the app by running `npm run dev`
5. Access the app on [http://localhost:3000](http://localhost:3000)

You should now be prompted to login with your chosen OAuth provider.

> [!NOTE]
> If using Basic Auth (DEV ONLY) any username you enter will create a new user id (hash of username@localhost). You can use this to simulate multiple users. Once successfully logged in, you can start creating new conversations.

[Next](/docs/4-deploy-to-azure.md)
