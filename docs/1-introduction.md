# 📘 Prerequisites

Please make sure the following prerequisites are in place prior to deploying this accelerator:

1. [Azure OpenAI](https://azure.microsoft.com/en-us/products/cognitive-services/openai-service/): To deploy and run the solution accelerator, you'll need an Azure subscription with access to the Azure OpenAI service. Request access [here](https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR7en2Ais5pxKtso_Pz4b1_xUOFA5Qk1UWDRBMjg0WFhPMkIzTzhKQ1dWNyQlQCN0PWcu). Once you have access, follow the instructions in this [link](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/how-to/create-resource?pivots=web-portal) to deploy the gpt-35-turbo or gpt-4 models.

2. Setup GitHub or Azure AD for Authentication:
   The [add an identity provider](./5-add-identity.md) section below shows how to configure authentication providers.

   > **Note**
   > You can configure the authentication provider to your identity solution using [NextAuth providers](https://next-auth.js.org/providers/)

## 👋🏻 Introduction

_Azure Chat Solution Accelerator powered by Azure Open AI Service_ solution accelerator is built using the following technologies:

- [Node.js 18](https://nodejs.org/en): an open-source, cross-platform JavaScript runtime environment.

- [Next.js 13](https://nextjs.org/docs): enables you to create full-stack web applications by extending the latest React features

- [NextAuth.js](https://next-auth.js.org/): configurable authentication framework for Next.js 13

- [ai sdk](https://sdk.vercel.ai/docs) Open-source library that simplifies building conversational UI on top Next.js and JavaScript

- [Tailwind CSS](https://tailwindcss.com/): is a utility-first CSS framework that provides a series of predefined classes that can be used to style each element by mixing and matching

- [shadcn/ui](https://ui.shadcn.com/): re-usable components built using Radix UI and Tailwind CSS.

- [Azure Cosmos DB](https://learn.microsoft.com/en-GB/azure/cosmos-db/nosql/): fully managed platform-as-a-service (PaaS) NoSQL database to store chat history

- [Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview): Azure OpenAI Service provides REST API access to OpenAI's powerful language models including the GPT-4, GPT-35-Turbo, and Embeddings model series.

- [Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/): fully managed platform-as-a-service (PaaS) for hosting web applications, REST APIs, and mobile back ends.

### Optional Azure Services

The following Azure services can be deployed to expand the feature set of your solution:

- [Azure Document Intelligence](https://learn.microsoft.com/en-GB/azure/ai-services/document-intelligence/) Microsoft Azure Form Recognizer is an automated data processing system that uses AI and OCR to quickly extract text and structure from documents. We use this service for extracting information from documents.

- [Azure Cognitive Search](https://learn.microsoft.com/en-GB/azure/search/) Azure Cognitive Search is an AI-powered platform as a service (PaaS) that helps developers build rich search experiences for applications. We use this service for indexing and retrieving information.

- [Azure OpenAI Embeddings](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/embeddings?tabs=console) for embed content extracted from files.

- [Azure Speech Service](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/): Speech recognition and generation with multi-lingual support and the ability to select and create custom voices.

# Solution Architecture

The following high-level diagram depicts the architecture of the solution accelerator:

![Architecture diagram](/images/architecture.png)

# Azure Deployment Costs

Pricing varies per region and usage, so it isn't possible to predict exact costs for your usage.
However, you can try the [Azure pricing calculator - Sample Estimate](https://azure.com/e/1f08b35661df4b5ea3663df112250b09) for the resources below.

- Azure App Service: Premium V3 Tier 1 CPU core, 4 GB RAM, 250 GB Storage. Pricing per hour. [Pricing](https://azure.microsoft.com/pricing/details/app-service/linux/)
- Azure Open AI: Standard tier, ChatGPT and Embedding models. Pricing per 1K tokens used, and at least 1K tokens are used per question. [Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/)
- Form Recognizer: SO (Standard) tier using pre-built layout. Pricing per document page, sample documents have 261 pages total. [Pricing](https://azure.microsoft.com/pricing/details/form-recognizer/)
- Azure Cognitive Search: Standard tier, 1 replica, free level of semantic search. Pricing per hour.[Pricing](https://azure.microsoft.com/pricing/details/search/)
- Azure Cosmos DB: Standard provisioned throughput with ZRS (Zone-redundant storage). Pricing per storage and read operations. [Pricing](https://azure.microsoft.com/en-us/pricing/details/cosmos-db/autoscale-provisioned/)
- Azure Monitor: Pay-as-you-go tier. Costs based on data ingested. [Pricing](https://azure.microsoft.com/pricing/details/monitor/)

To reduce costs, you can switch to free SKUs for Azure App Service, Azure Cognitive Search, and Form Recognizer by changing the parameters file under the `./infra` folder. There are some limits to consider; for example, you can have up to 1 free Cognitive Search resource per subscription, and the free Form Recognizer resource only analyzes the first 2 pages of each document. You can also reduce costs associated with the Form Recognizer by reducing the number of documents you upload.

> **Warning**
> To avoid unnecessary costs, remember to destroy your provisioned resources by deleting the resource group.

[Next](/docs/2-provision-azure-resources.md)
