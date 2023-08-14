# 📃 Chatting with your file

Users can utilise this functionality to upload their PDF files through the portal and engage in chat discussions related to the content of those files.

Chat with your data utilises the following Azure Services:

1. [Azure Document Intelligence](https://learn.microsoft.com/en-GB/azure/ai-services/document-intelligence/) for extracting information from documents.
1. [Azure Cognitive Search](https://learn.microsoft.com/en-GB/azure/search/) for indexing and retrieving information.
1. [Azure OpenAI Embeddings](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/embeddings?tabs=console) for embed content extracted from files

### Azure OpenAI Embeddings

We use Azure OpenAI Embeddings to convert text to vectors and index it in Azure Cognitive Search.

update the OpenAI environment variables with the following:

```
AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME=
```

When deploying to Azure, ensure to update the Azure App service app settings with AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME

### Setup Azure Cognitive Search index and Document Intelligence

1. Create Azure Cognitive Search using the following [link](https://learn.microsoft.com/en-us/azure/search/search-get-started-portal)
1. Create an index on Azure Cognitive Search with the following schema. You can use the Azure portal to create the following [indexes](https://learn.microsoft.com/en-us/azure/search/vector-search-how-to-create-index?tabs=portal-add-field%2Cpush)

```
{
      "name": "azure-chatgpt",
      "fields": [
        {
          "name": "id",
          "type": "Edm.String",
          "key": true,
          "filterable": true
        },
        {
          "name": "user",
          "type": "Edm.String",
          "searchable": true,
          "filterable": true
        },
        {
          "name": "chatThreadId",
          "type": "Edm.String",
          "searchable": true,
          "filterable": true
        },
         {
          "name": "pageContent",
          "searchable": true,
          "type": "Edm.String"
        },
         {
          "name": "metadata",
          "type": "Edm.String"
        },
        {
          "name": "embedding",
          "type": "Collection(Edm.Single)",
          "searchable": true,
          "filterable": false,
          "sortable": false,
          "facetable": false,
          "retrievable": true,
          "analyzer": "",
          "dimensions": 1536,
          "vectorSearchConfiguration": "vectorConfig"
        }
      ],
        "vectorSearch": {
            "algorithmConfigurations": [
                {
                    "name": "vectorConfig",
                    "kind": "hnsw"
                }
            ]
        }
    }
```

2. After the index has been created, proceed to modify the env.local file with the appropriate Azure Cognitive Search environment variables.

```
# Azure cognitive search is used for chat over your data
AZURE_SEARCH_API_KEY=
AZURE_SEARCH_NAME=
AZURE_SEARCH_INDEX_NAME=
AZURE_SEARCH_API_VERSION="2023-07-01-Preview"
```

3. Create an instance of Azure Form Recognizer (also known as Azure Document Intelligence) using the following [link](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-3.1.0). Please be aware that this resource might be called *Form recognizer* in Azure Portal.

4. After the Form Recognizer (Document Intelligence) resource has been created, proceed to modify the `env.local` file with appropriate environment variables. You can find values for these variables in your _Form Recognizer_ resource (Resource Management blade > Keys and Endpoint). Please make sure that you don't copy the endpoint from there, but only replace the region in the example below. For example, if your Form Recognizer resource is located in East US Azure region, your `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` variable would be `https://eastus.api.cognitive.microsoft.com/`.

   Please note that the file is only preserved for each chat thread:
      ```
      # Azure AI Document Intelligence to extract content from your data
      AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT="https://REGION.api.cognitive.microsoft.com/"
      AZURE_DOCUMENT_INTELLIGENCE_KEY=
      ```
5. At this point, you should be able to start new chat sessions with the `File` option.
   ![](/images/personalise-session.png)
7. Once the `File` chat option is selected, click the `Choose File` button to select your document and then click the `Upload` button to upload your file. Please note that the Form Recognizer service supports PDF (text or scanned), JPG and PNG input documents.
8. Once you receive a notification about a successful file upload, you should be able to start chatting with chatting with a chatbot.

### Things to consider:

1. Central place maintain uploaded files (e.g a storage account with blob storage)
2. A way to delete indexed documents on Azure Cognitive Search if the chat thread is deleted

[Next](/docs/7-environment-variables.md)
