# 📃 Chatting With Your File

Users can utilise this functionality to upload their PDF files through the portal and engage in chat discussions related to the content of those files.

Chat with your data utilises the following Azure Services:

1. [Azure Document Intelligence](https://learn.microsoft.com/en-GB/azure/ai-services/document-intelligence/) for extracting information from documents.
1. [Azure Cognitive Search](https://learn.microsoft.com/en-GB/azure/search/) for indexing and retrieving information.
1. [Azure OpenAI Embeddings](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/embeddings?tabs=console) for embed content extracted from files

![](/images/chatover-file.png)

### Things to Consider

1. Central place maintain uploaded files (e.g a storage account with blob storage)
2. A way to delete indexed documents on Azure Cognitive Search if the chat thread is deleted

[Next](/docs/7-environment-variables.md)
