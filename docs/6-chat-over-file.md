# 📃 Chatting with your unstructured data

Users can utilise this functionality to upload their PDF files through the portal and engage in chat discussions related to the content of those files.

### Setup Azure Cognitive Search index

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
3. At this point, you have the capability to generate a new chat session with opting for the `file chat` type. Click on the upload button to to start uploading a PDF file.
4. Upon the successful completion of the file upload, you are now able to commence the conversation using the provided text box.

### Things to consider:

1. Central place maintain uploaded files
2. Currently only PDF files are supported, add additional file types
3. A way to delete indexed documents on Azure Cognitive Search if the chat thread is deleted
4. Integrate [Azure Document Intelligence](https://azure.microsoft.com/en-us/products/ai-services/ai-document-intelligence) to extract better information from files
