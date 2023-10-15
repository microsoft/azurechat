# TODO
- System Prompt
- Memory and Chat History
- Log Plugin and Function call information to user messages
- AI Plugin authentication methods
- OpenAPIChain call with different auth -- configure and pass in SimpleRequestChain
- Validate openAPI spec before loading in chain
- Load plugins from somewhere besides disk

# Approach
We want to add plugin support to AzureChat, similar to how ChatGPT does it. It's not clear the method they use, they have a plugin-level file and then the OpenAPI spec for the API.

There are a few approaches to consider.

Here's how it's currently implemented:

## Hybrid of Vercel Experimental Functions + Langchain OpenAI Functions + OpenAPI chain
Load Plugins as "Functions" and allow the model to call a plugin (dressed as a function) at the top level. This should be easy to code as the ai-plugin.json spec is super simple.

Then use the Langchain [OpenAI Functions : OpenAPI calls chain](https://js.langchain.com/docs/modules/chains/additional/openai_functions/openapi) chain to actually call the required API using functions.
Ideally, we should pass the full message history to the chain call so that it can re-use any contextual information from the conversation.

# Useful frameworks

## Langchain 
- Agent: OpenAI functions
  - https://js.langchain.com/docs/modules/agents/agent_types/openai_functions_agent 
  - use functions for reliability
  - has an OpenAPI calling chain
  - challenges:
    - convert APIs to tools
    - API auth?
    - memory?

- Agent: Conversational agent
  - https://js.langchain.com/docs/modules/agents/agent_types/chat_conversation_agent
  - supports prompt & memory
  - challenges: 
    - convert APIs to tools
    - API auth?


- Chain: OpenAPI Calls
  - https://js.langchain.com/docs/modules/chains/additional/openai_functions/openapi 
  - use functions for reliability
  - challenges:
    - this is a chain (one-way), not an agent
    - returns JSON from API

## Langchain Tools
- AIPluginTool - ChatGPT plugins
  - https://js.langchain.com/docs/modules/agents/tools/integrations/aiplugin-tool 
  - load plugin level
  - challenges:
    - no API auth
    - requires HTTP request tools
    - seems inefficient - LLM has to read OpenAPI spec

- Structured Tools
  - https://js.langchain.com/docs/modules/agents/agent_types/structured_chat 

- NLA Toolkit - 
  - https://python.langchain.com/docs/integrations/toolkits/openapi_nla
  - converts APIs to NLA tools?

## Vercel SDK Function Calling
- based on what I did in other repo
- full control of prompting
- more efficient - pure functions model
- more secure - we write the HTTP fetch calls not GPT
- challenges:
  - copy code from OpenAI functions chain to convert APIs to functions

## Vercel SDK OpenAI / Langchain