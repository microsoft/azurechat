# 👨🏻‍💻 Run Locally

Clone this repository locally or fork to your GitHub account. Run all of the the steps below from the `src` directory.

## Prerequisites

- **History Database**: If you don't want to [provision the Azure resources](./4-deploy-to-azure.md), you **must** at least deploy an instance of Azure Cosmos DB in your Azure Subscription to store chat history.

- **Identity Provider**: For local development, you have the option of using a username / password to sign in. If you prefer to use an Identity Provider, follow the [instructions](./3-add-identity.md) in the next chapter to add one.

## Steps to Run Locally

1. Change directory to the `src` folder
2. Rename/copy the file `.env.example` to `.env.local` and populate the environment variables based on the deployed resources in Azure.
3. Install npm packages by running `npm install`
4. Start the app by running `npm run dev`
5. Access the app on [http://localhost:3000](http://localhost:3000)

You should now be prompted to log in with your chosen authentication method (per the pre-requisite configuration).

> **NOTE**
> If using Basic Auth (DEV ONLY), any username you enter will create a new user id (hash of username@localhost). You can use this to simulate multiple users. Once successfully logged in, you can start creating new conversations.

## Continue to the next step...

👉 [Next: Add an Identity Provider](./3-add-identity.md)
