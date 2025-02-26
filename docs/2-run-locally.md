# 👨🏻‍💻 Run Locally

Clone this repository locally or fork to your GitHub account. Follow the steps below to run the solution locally:

## Prerequisites

Azure Chat is heavily dependant on a large number of Azure services. The easiest way to deploy all of these required services into an Azure subscription is to use the the [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview) as follows: 

1. Install the [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview)
1. From the root of the repository:

    1. Run `azd init` 
    1. Run `azd provision` to provision the Azure resources


## Identity Provider

For local development you can use the `Basic Auth (DEV ONLY)` provider to sign in - this local development identity provider will accept any user name and password, and the username you enter will create a new user id (hash of username@localhost) so you can simulate multiple users. If you prefer to use an Identity Provider (Entra ID or GitHub) for local development follow the [instructions](./3-add-identity.md) in the next chapter to add one.

## Run the App

With the prerequisites complete, follow the steps below to run the solution locally:

1. Change directory to the `src` folder
2. Rename/copy the file `.env.example` to `.env` and populate the environment variables based on the deployed resources in Azure.

      > **NOTE**  
      > If you have used the Azure Developer CLI to deploy the Azure services required for the solution (as described above), you can find the values for most the required environment variables in the `.env` file the `.azure\<azd env name>` directory. This generated file will not contain any keys, however it is recommended to use managed identities as described in "Run Locally with Managed Identities" on [this page](./9-managed-identities.md).

3. Install npm packages by running `npm install`
4. Start the app by running `npm run dev`
5. Access the app on [http://localhost:3000](http://localhost:3000)

You should now be prompted to log in with your chosen authentication method (per your Identity Provider configuration), and you can start chatting.

## Continue to the next step...

👉 [Next: Add an Identity Provider](./3-add-identity.md)
