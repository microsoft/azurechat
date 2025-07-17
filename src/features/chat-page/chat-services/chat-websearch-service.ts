"use server";
import "server-only";

import { AgentsClient, MessageStreamEvent, DoneEvent, ErrorEvent } from "@azure/ai-agents";
import { DefaultAzureCredential } from "@azure/identity";
import { ChatThreadModel } from "./models";

/**
 * Calls the Azure AI Foundry Agent for web search and returns the full response as a string.
 */
export async function ChatWebSearchService(props: {
  chatThread: ChatThreadModel;
  userMessage: string;
}): Promise<string> {
  // read required environment variables
  const projectEndpoint = process.env.PROJECT_ENDPOINT;
  const agentId = process.env.AGENT_ID;
  if (!projectEndpoint) {
    throw new Error("Environment variable PROJECT_ENDPOINT must be set");
  }
  if (!agentId) {
    throw new Error("Environment variable AGENT_ID must be set");
  }
  const credential = new DefaultAzureCredential();
  const client = new AgentsClient(projectEndpoint, credential);
  // Create a new Azure Agent thread for this interaction
  const thread = await client.threads.create();
  // Send the user message into the Azure Agent thread
  await client.messages.create(thread.id, "user", props.userMessage);

  console.log("\n\n====DEBUG: Thread created:", thread.id);

  // Start a threaded run for the agent, poll for completion
  const run = await client.runs.createAndPoll(thread.id, agentId, {
    pollingOptions: {
      intervalInMs: 1000,
    },
     onResponse: (response): void => {
      if (response.parsedBody && typeof response.parsedBody === "object" && "status" in response.parsedBody) {
        console.log(`\n\n===DEBUG Received response with status: ${response.parsedBody.status}`);
      } else {
        console.log("\n\n===DEBUG Received response with no status or parsedBody is null/undefined.");
      }
    },
  });
  console.log(`\n\n===DEBUG Run finished with status: ${run.status}`);

  if (run.status !== "completed") {
    throw new Error(`Agent run did not complete successfully. Status: ${run.status}`);
  }

  // Fetch and return only the first assistant message from the thread
  const messagesIterator = client.messages.list(thread.id);
  const firstMessage = await messagesIterator.next();

  console.log("\n\n===DEBUG Raw message:\n", firstMessage);

  if (!firstMessage.done && firstMessage.value) {
    const msg = firstMessage.value;

    if (msg.role === "assistant" && msg.content && msg.content.length > 0) {
      const content = msg.content[0];
      if (content.type === "text" && "text" in content) {

        console.log("\n\n===DEBUG Assistant message content:\n", content);
        console.log("\n\n===DEBUG Assistant message annotations:\n", content.text.annotations);

        // Replace annotation tags in the text with Markdown links, e.g. [1](url) [2](url)
        let responseText = content.text.value;
        if (Array.isArray(content.text.annotations)) {
 
          // Use incrementing numbers for citation links
          let citationNumber = 1;
          content.text.annotations.forEach(ann => {
            if (!("urlCitation" in ann) || typeof ann.urlCitation !== "object" || !("url" in ann.urlCitation) || typeof ann.urlCitation.url !== "string") {
              console.warn("Annotation does not have a valid URL citation:", ann);
              return;
            }
            const markdownCitation = ` [[${citationNumber}]](${ann.urlCitation.url})`;
            responseText = responseText.replace(ann.text, markdownCitation);
            citationNumber++;
          });
        }
        return responseText;
      }
    }
  }
  return "No response received from WebSearch tool";
}
