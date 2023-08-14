# 📘 Prerequisites

1. [Azure OpenAI](https://azure.microsoft.com/en-us/products/cognitive-services/openai-service/): To deploy and run ChatGPT on Azure, you'll need an Azure subscription with access to the Azure OpenAI service. Request access [here](https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR7en2Ais5pxKtso_Pz4b1_xUOFA5Qk1UWDRBMjg0WFhPMkIzTzhKQ1dWNyQlQCN0PWcu). Once you have access, follow the instructions in this [link](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/how-to/create-resource?pivots=web-portal) to deploy the gpt-35-turbo or gpt-4 models.

2. Setup GitHub or Azure AD for Authentication:
   The [add an identity provider](https://github.com/oliverlabs/azurechatgpt#-add-an-identity-provider) section below shows how to configure authentication providers.

   💡Note: You can configure the authentication provider to your identity solution using [NextAuth providers](https://next-auth.js.org/providers/)

# 👋🏻 Introduction

ChatGPT on Azure solution accelerator is built with the following technologies.

[Node.js 18](https://nodejs.org/en): an open-source, cross-platform JavaScript runtime environment.

[Next.js 13](https://nextjs.org/docs): enables you to create full-stack web applications by extending the latest React features

[NextAuth.js](https://next-auth.js.org/): configurable authentication framework for Next.js 13

[LangChain JS](https://www.langchain.com/): AI orchestration layer to build intelligent apps

[ai sdk](https://sdk.vercel.ai/docs) Open-source library that simplifies building conversational UI on top Next.js and JavaScript

[Tailwind CSS](https://tailwindcss.com/): is a utility-first CSS framework that provides a series of predefined classes that can be used to style each element by mixing and matching

[shadcn/ui](https://ui.shadcn.com/): re-usable components built using Radix UI and Tailwind CSS.

[Azure Cosmos DB](https://learn.microsoft.com/en-GB/azure/cosmos-db/nosql/): fully managed platform-as-a-service (PaaS) NoSQL database to store chat history

[Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/): fully managed platform-as-a-service (PaaS) for hosting web applications, REST APIs, and mobile back ends.

### Optional Azure

[Azure Document Intelligence](https://learn.microsoft.com/en-GB/azure/ai-services/document-intelligence/) Microsoft Azure Form Recognizer is an automated data processing system that uses AI and OCR to quickly extract text and structure from documents. We use this service for extracting information from documents.

[Azure Cognitive Search](https://learn.microsoft.com/en-GB/azure/search/) Azure Cognitive Search is an AI-powered platform as a service (PaaS) that helps developers build rich search experiences for applications. We use this service for indexing and retrieving information.

[Azure OpenAI Embeddings](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/embeddings?tabs=console) for embed content extracted from files

![](/images/architecture.png)

[Next](/docs/2-provision-azure-resources.md)
