# 📃 Chatting With Your File

There are multiple ways you can integrate chat with your data.

# **Upload a file and chat with your file using the chat interface.**

Users can utilise this functionality to upload their files through the portal and engage in chat discussions related to the content of those files.

Advantages of using this approach:

1.  Simple and easy to use.
2.  File content is indexed and maintained within the chat interface and it is only available for the current chat session.

Chat with your data utilises the following Azure Services:

Once the file is uploaded, the content is extracted and indexed using Azure AI Search. The content is then used to generate embeddings using Azure OpenAI Embeddings. The embeddings are then used to generate a similarity score between the uploaded file and the chat messages. The chat messages are then filtered based on the similarity score and displayed to the user.

3.  [Azure Document Intelligence](https://learn.microsoft.com/en-GB/azure/ai-services/document-intelligence/) for extracting information from documents.
4.  [Azure AI Search ](https://learn.microsoft.com/en-GB/azure/search/) for indexing and retrieving information.
5.  [Azure OpenAI Embeddings](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/embeddings?tabs=console) for embed content extracted from files

![](/docs/images/chatover-file.png)

# **Bring your own Azure AI Search.**

With the help of Extensions feature you can bring your own Azure AI Search and integrate it with the chat interface. This will allow you to search and retrieve information from your own data source.

Advantages of using this approach:

1.  Index and maintain your own data outside of Azure Chat.
2.  Re-use the index across multiple chat sessions.
3.  As an admin, you can publish the index across organisation. e.g. HR, Finance, IT etc.

Steps to integrate your own Azure AI Search:

1. Navigate to the Extensions page and click on the "Azure AI search" button.
2. Fill in the first section with the following details:

![](/docs/images/extensions/extension-azure-ai-search-1.png)

- **Name**: Name of the extension e.g. "HR Search"
- **Description**: Description of the extension e.g. "Search HR documents"
- **Detail description**:

Change the description to match your use case. However, the citation section must remain the same.

```markdown
You are an expert in searching internal documents using aisearch function. You must always include a citation at the end of your answer and don't include a full stop after the citations.

Use the format for your citation {% citation items=[{name:\"filename 1\",id:\"file id\"}, {name:\"filename 2\",id:\"file id\"}] /%}
```

3. Fill in the Headers section with the following details:

![](/docs/images/extensions/extension-azure-ai-search-2.png)

- **vectors**: Comma separated values of the vectors on the index e.g. "title, content"
- **apiKey**: API key for the Azure AI Search
- **searchName**: Name of the Azure AI Search service
- **indexName**: Name of the Azure AI Search index

4. Update the function definition and publish the extension.

![](/docs/images/extensions/extension-azure-ai-search-3.png)

- **Method**: POST
- **URL**: `https://REPLACE_WITH_YOUR_DOMAIN.COM/api/document`
- **Function**:

Update the description and parameters to match your use case.

```json
{
  "name": "aisearch",
  "parameters": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "description": "Body of search for relevant information",
        "properties": {
          "search": {
            "type": "string",
            "description": "The exact search value from the user"
          }
        },
        "required": ["search"]
      }
    },
    "required": ["body"]
  },
  "description": "DESCRIBE YOUR SEARCH DESCRIPTION HERE"
}
```

Save the function and publish the extension.

[Next](/docs/6-persona.md)
