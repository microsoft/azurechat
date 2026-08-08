# 📃 Chatting With Your File

There are multiple ways you can integrate chat-with-your-data, in this guide you will learn how to enable users to upload a file through Azure Chat and engage in chat discussions related to the file contents.

1. This approach is simple and easy to use.
2. File contents are indexed and maintained within the chat interface and are only available for the current chat session by the current user.

Chat with your Data utilises the following Azure AI Services:

1.  [Azure AI Document Intelligence](https://learn.microsoft.com/en-GB/azure/ai-services/document-intelligence/) for extracting information from documents.
2.  [Azure AI Search](https://learn.microsoft.com/en-GB/azure/search/) for indexing and retrieving information.
3.  [Azure OpenAI Embeddings](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/embeddings?tabs=console) for embed content extracted from files

## Understanding the RAG Pattern

Once the file is uploaded, the content is extracted using Azure AI Document Intelligence. It is then used to generate embeddings using Azure OpenAI's embedding model (created during the initial deployment). These are stored in Azure AI Search as vectors.

When a question is entered by the user, the embedding (vector) of the user's input is compared to those indexed in Azure AI Search to generate a similarity score. Relevant (or most similar) chunks (parts/paragraphs) from the uploaded document as determined during this retrieval and similarity scoring are passed to the language model as additional context alongside the user's question to generate responses grounded in the uploaded file. This is a simple description of the RAG (Retrieval-Augmented Generation) pattern.

![Chat over file](/docs/images/chatover-file.png)

## Bring your own Azure AI Search Index

Chatting with a user-uploaded file works well for ad-hoc conversations. However, you may want to index and maintain your own organisational data outside of Azure Chat, making it available across multiple chat sessions and allowing your organisation to index larger datasets / documents / policies etc.

With the help of the Extensions feature you can bring your own Azure AI Search index and integrate it with the chat interface. This will allow you to search and retrieve information from your own data source - not just the uploaded file in the current chat session.

## Advantages of using this approach:

1.  Index and maintain your data outside of Azure Chat.
2.  Re-use the index across multiple chat sessions.
3.  As an admin, you can publish the index across the organisation. e.g. HR, Finance, IT etc.
4.  Frequent updates or changes to the dataset (e.g. policies, procedures) can be centrally re-indexed (via an Azure AI Search indexer) on a customised schedule to ensure the latest information is available to users.

## Integrating your own Azure AI Search

1. Navigate to the Extensions page and click on the "Azure AI Search" button.
2. Fill in the first section with the following details:
   ![New Extension](/docs/images/extensions/extension-azure-ai-search-1.png)

   - **Name**: Name of the extension e.g. "HR Search"
   - **Description**: Description of the extension e.g. "Search HR documents"
   - **Detail description**: Change the description to match your use case. However, the citation section must remain the same.

   ```markdown
   You are an expert in searching internal documents using aisearch function. You must always include a citation at the end of your answer and don't include a full stop after the citations.

   Use the format for your citation {% citation items=[{name:\"filename 1\",id:\"file id\"}, {name:\"filename 2\",id:\"file id\"}] /%}
   ```

3. Fill in the Headers section with the following details:
   ![Configure Headers](/docs/images/extensions/extension-azure-ai-search-2.png)

   - **vectors**: Comma separated values of the vectors on the index e.g. "title, content"
   - **apiKey**: API key for the Azure AI Search
   - **searchName**: Name of the Azure AI Search service
   - **indexName**: Name of the Azure AI Search index

4. Update the function definition and publish the extension.
   ![Publish and Save](/docs/images/extensions/extension-azure-ai-search-3.png)

   - **Method**: POST
   - **URL**: `https://REPLACE_WITH_YOUR_DOMAIN.COM/api/document`
   - **Function**: Update the description and parameters to match your use case.

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

5. Save the function and publish the extension.

## Continue to the next step...

👉 [Next: Personas](./6-persona.md)
