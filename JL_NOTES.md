# TODO
- Call a Plugin + API
- Upgrade Langchain
  - to support AgentExecutor handleParsingErrors
- Log plugin call to user chat
- Load plugins from somewhere (disk / DB)

# APPROACHES
## Langchain 
- Agent: OpenAI functions
  - https://js.langchain.com/docs/modules/agents/agent_types/openai_functions_agent 
  - use functions for reliability
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

## Vercel SDK Function Calling
- based on what I did in other repo
- full control of prompting
- more efficient - pure functions model
- more secure - we write the HTTP fetch calls not GPT
- challenges:
  - copy code from OpenAI functions chain to convert APIs to functions

# Useful bits and pieces

## Tools 
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


- Handlers for callback
  - Vercel LangChainStream
  - Could grab agent changes

