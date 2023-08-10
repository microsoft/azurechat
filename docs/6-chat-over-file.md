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

3. Create Azure Document intelligence using the following [link](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-3.1.0)

4. After the Document intelligence has been created, proceed to modify the env.local file with the appropriate Document intelligence environment variables.

Note that the file is only preserved for each chat thread

```
# Azure AI Document Intelligence to extract content from your data
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT="https://REGION.api.cognitive.microsoft.com/"
AZURE_DOCUMENT_INTELLIGENCE_KEY=
```

4. At this point, you have the capability to generate a new chat session with opting for the `file chat` type. Click on the upload button to to start uploading a PDF file.
5. Upon the successful completion of the file upload, you are now able to commence the conversation using the provided text box.

### Things to consider:

1. Central place maintain uploaded files
2. A way to delete indexed documents on Azure Cognitive Search if the chat thread is deleted

[Next](/docs/7-environment-variables.md)
