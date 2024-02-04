# 💡🔗 Extensions

With Extensions, you can enhance the functionality of Azure Chat by integrating it with your internal APIs or external resources.Extensions are created using OpenAI Tools, specifically through Function Calling.

As a user, you have the ability to create extensions that call your own internal APIs or external resources. However, if you are an admin, you can create extensions that can be utilised by all users within your organization.

Refer to the [OpenAI Tools](https://platform.openai.com/docs/guides/function-calling) documentation for more information on how tools and functions call works.

Azure Chat expects the following from the function definition:

```json
{
  "name": "FunctionName",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "object",
        "description": "Query parameters",
        "properties": {
          // Query parameters
        },
        "required": [
          // comma separated parameters of the required query parameters
        ]
      },
      "body": {
        "type": "object",
        "description": "Body of the...",
        "properties": {
          // Body parameters
        },
        "required": [
          // comma separated parameters of the required body parameters
        ]
      }
    },
    "required": [
      // query or body are optional however at least one of them must be required e.g. ["query"] or ["body"] or ["query", "body"]
    ]
  },
  "description": "Description of the function"
}
```

As an example you can create an extension that calls Bing Search API to search for a specific topic and return the results to the user.

In the example below only the `query` is required as Bing does not require a body parameter.

# Bing Search Extension

1.  **Name**: `Bing Search`
2.  **Short Description**: `Bring up to date information with Bing Search`
3.  **Detail Description**:

    ```markdown
    You are an expert in searching the web using BingSearch function.
    ```

    The detail description will be injected into chat as a system message.

4.  **Headers**: A collection of secure header values to be passed to the function. The header values are stored securely in Azure Key Vault and are passed to the function as part of the request.

5.  **Function**:

    - API Endpoint: GET https://api.bing.microsoft.com/v7.0/search?q=BING_SEARCH_QUERY

      BIG_SEARCH_QUERY is a variable that will be replaced with the search query entered by the user. The BIG_SEARCH_QUERY will be automatically passed to the function as part of the request based on the function definition below.

    - Function definition:

      ```json
      {
        "name": "BingSearch",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "object",
              "description": "Ues this as the search query parameters",
              "properties": {
                "BING_SEARCH_QUERY": {
                  "type": "string",
                  "description": "Search query from the user",
                  "example": "What is the current weather in Sydney, Australia?"
                }
              },
              "example": {
                "BING_SEARCH_QUERY": "What is the current weather in Sydney, Australia?"
              },
              "required": ["BING_SEARCH_QUERY"]
            }
          },
          "required": ["query"]
        },
        "description": "Use BingSearch to search for information on the web to bring up to date information"
      }
      ```

6.  **Publish**: Publish the extension to make it available to use in your conversations. Publish is an admin only feature. If you are not an admin you will not see the publish button.

# GitHub Issues Extension

This example is much more complex as it is capable of invoking multiple APIs to create or update a GitHub Issue depending on the user question.

In this example you will be able to create and update GitHub Issues using the GitHub API.

1.  **Name**: `GitHub Issues`
2.  **Short Description**: `Create and update GitHub Issues`
3.  **Detail Description**:

    ```markdown
    You are an expert in creating and updating GitHub Issues.
    CreateGitHubIssue is used to create GitHub Issues.
    UpdateGitHubIssue is used to update GitHub Issues.

    If the user doesn't provide a GitHub Issue ID ensure to use the ID mentioned in the previous chat messages.
    ```

    The detail description is injected into chat as a system message.

4.  **Headers**: Secure header values to be passed to the function.

    ```markdown
    Authorization: Bearer GITHUB_TOKEN
    Accept: application/vnd.github.v3+json
    X-GitHub-Api-Version 2022-11-28
    ```

5.  **Function**

    5.1 **CreateGitHubIssue Function**

    - API Endpoint:

      ```markdown
      POST https://api.github.com/repos/GITHUB_OWNER/GITHUB_REPO/issues
      ```

      Ensure to replace the GITHUB_OWNER and GITHUB_REPO with the repository you want to create the issue in.

    - The function definition for creating GitHub issue

      The `body` parameter is required by Azure Chat as it uses it to generate request body for the function call. The parameters of the `body` is a representation of the GitHub issues API. You can find the full documentation [here](https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#create-an-issue).

      ```json
      {
        "name": "CreateGitHubIssue",
        "parameters": {
          "type": "object",
          "properties": {
            "body": {
              "type": "object",
              "description": "Body of the GitHub issue",
              "properties": {
                "title": {
                  "type": "string",
                  "description": "Title of the issue",
                  "example": "I'm having a problem with this."
                },
                "body": {
                  "type": "string",
                  "description": "Body of the issue",
                  "example": "I'm having a problem with this."
                },
                "labels": {
                  "type": "array",
                  "description": "Labels to add to the issue",
                  "items": {
                    "type": "string",
                    "example": "bug"
                  }
                }
              },
              "example": {
                "title": "I'm having a problem with this.",
                "body": "I'm having a problem with this.",
                "labels": ["bug"]
              },
              "required": ["title"]
            }
          },
          "required": ["body"]
        },
        "description": "You must use this to only create an existing GitHub issue"
      }
      ```

      5.2 **UpdateGitHubIssue Function**

      - API Endpoint:

      ```markdown
      POST https://api.github.com/repos/GITHUB_OWNER/GITHUB_REPO/issues/ISSUE_NUMBER
      ```

      The ISSUE_NUMBER will be automatically passed to the function as part of the request based on the function definition below.

    - The function definition for updating GitHub issue

      The `body` parameter is the same scheme as CreateGitHubIssue function. However you will notice that the `query` parameter is added to the function definition. This is because Azure Chat will automatically pass the query parameters to the function as part of the request. In this case the query parameter is ISSUE_NUMBER.G

      ```json
      {
        "name": "UpdateGitHubIssue",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "object",
              "description": "Query parameters",
              "properties": {
                "ISSUE_NUMBER": {
                  "type": "string",
                  "description": "Github issue number",
                  "example": "123"
                }
              },
              "example": {
                "ISSUE_NUMBER": "123"
              },
              "required": ["ISSUE_NUMBER"]
            },
            "body": {
              "type": "object",
              "description": "Body of the GitHub issue",
              "properties": {
                "title": {
                  "type": "string",
                  "description": "Title of the issue",
                  "example": "I'm having a problem with this."
                },
                "body": {
                  "type": "string",
                  "description": "Body of the issue",
                  "example": "I'm having a problem with this."
                },
                "labels": {
                  "type": "array",
                  "description": "Labels to add to the issue",
                  "items": {
                    "type": "string",
                    "example": "bug"
                  }
                }
              },
              "example": {
                "title": "I'm having a problem with this.",
                "body": "I'm having a problem with this.",
                "labels": ["bug"]
              },
              "required": ["title"]
            }
          },
          "required": ["body", "query"]
        },
        "description": "You must use this to only update an existing GitHub issue"
      }
      ```

    [Next](/docs/9-environment-variables.md)
