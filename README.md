# Unleash the Power of Azure Open AI

1. [Introduction](#introduction)
1. [Solution Overview](/docs/1-introduction.md)
1. [Provision Azure Resources](/docs/2-provision-azure-resources.md)
1. [Run AzureChat from your local machine](/docs/3-run-locally.md)
1. [Deploy AzureChat to Azure](/docs/4-deployto-azure.md)
1. [Add identity provider](/docs/5-add-Identity.md)
1. [Chatting with your file](/docs/6-chat-over-file.md)
1. [Environment variables](/docs/7-environment-variables.md)

# Introduction

Solution Accelerator: AzureChat powered by Azure OpenAI Service

![](/images/intro.png)

AzureChat powered by Azure OpenAI is an enterprise ready deployment option. This accelerator provides organisations with secure and powerful chat capabilities with a familiar user experience and with the added capabilities of chatting over your data and files.

Benefits are:

1. Private: Built-in guarantees around the privacy of your data and fully isolated.

2. Controlled: Network traffic can be fully isolated to your network and other enterprise grade security controls are built in.

3. Value: Deliver added business value with your own internal data sources (plug and play) or use plug-ins to integrate with your internal services (e.g., ServiceNow, etc).

[Next](./docs/1-introduction.md)

# Azure Deployment Costs

Pricing varies per region and usage, so it isn't possible to predict exact costs for your usage.
However, you can try the [Azure pricing calculator - Sample Estimate for Azure Chat App](https://azure.com/e/1f08b35661df4b5ea3663df112250b09) for the resources below.

- Azure App Service: Premium V3 Tier 1 CPU core, 4 GB RAM, 250 GB Storage. Pricing per hour. [Pricing](https://azure.microsoft.com/pricing/details/app-service/linux/)
- Azure Open AI: Standard tier, ChatGPT and Embedding models. Pricing per 1K tokens used, and at least 1K tokens are used per question. [Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/)
- Form Recognizer: SO (Standard) tier using pre-built layout. Pricing per document page, sample documents have 261 pages total. [Pricing](https://azure.microsoft.com/pricing/details/form-recognizer/)
- Azure Cognitive Search: Standard tier, 1 replica, free level of semantic search. Pricing per hour.[Pricing](https://azure.microsoft.com/pricing/details/search/)
- Azure Cosmos DB: Standard provisioned throughput with ZRS (Zone-redundant storage). Pricing per storage and read operations. [Pricing](https://azure.microsoft.com/en-us/pricing/details/cosmos-db/autoscale-provisioned/)
- Azure Monitor: Pay-as-you-go tier. Costs based on data ingested. [Pricing](https://azure.microsoft.com/pricing/details/monitor/)

To reduce costs, you can switch to free SKUs for Azure App Service, Azure Cognitive Search, and Form Recognizer by changing the parameters file under the `./infra` folder. There are some limits to consider; for example, you can have up to 1 free Cognitive Search resource per subscription, and the free Form Recognizer resource only analyzes the first 2 pages of each document. You can also reduce costs associated with the Form Recognizer by reducing the number of documents you upload.

⚠️ To avoid unnecessary costs, remember to destroy your provisioned resources by deleting the resource group.

# Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

# Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
