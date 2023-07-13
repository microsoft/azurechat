import { OpenAISSEParser } from "./openai-sse-parser";

export class AzureOpenAI {
  private configuration: AzureOpenAIConfiguration;

  constructor(configuration: AzureOpenAIConfiguration) {
    this.configuration = configuration;
  }

  public async createChatCompletion(
    createChatCompletionRequest: CreateChatCompletionRequest
  ) {
    const chatAPI = `https://${process.env.AZURE_OPENAI_API_INSTANCE_NAME}.openai.azure.com/openai/deployments/${process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`;
    const jsonString = this.stringifyJsonWithoutNulls(
      createChatCompletionRequest
    );

    const response = await fetch(chatAPI, {
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_API_KEY,
      },
      method: "POST",
      body: jsonString,
    });

    const stream = this.createStreamFromResponse(response);
    return stream;
  }

  private async processResponse(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    controller: ReadableStreamDefaultController<string>
  ) {
    const decoder = new TextDecoder();
    let accumulatedData = "";
    const sseParser = new OpenAISSEParser(controller);

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        if (accumulatedData) {
          if (this.configuration.onCompletion) {
            await this.configuration.onCompletion(accumulatedData);
          }
        }
        break;
      }

      const chunkValue = decoder.decode(value, { stream: true });
      accumulatedData += sseParser.parseSSE(chunkValue);
    }

    controller.close();
    reader.releaseLock();
  }

  private triggerError(error: any) {
    if (this.configuration.onError) {
      this.configuration.onError(error);
    }
  }

  private createStreamFromResponse(response: Response) {
    const source: UnderlyingDefaultSource<any> = {
      start: async (controller) => {
        if (response && response.body && response.ok) {
          const reader = response.body.getReader();
          try {
            await this.processResponse(reader, controller);
          } catch (e) {
            this.triggerError(e);
            controller.error(e);
          }
        } else {
          if (!response.ok) {
            this.triggerError(response.statusText);
            controller.error(response.statusText);
          } else {
            const error = "No response body";
            this.triggerError(error);
            controller.error(error);
          }
        }
      },
    };

    return new ReadableStream(source);
  }

  private stringifyJsonWithoutNulls(obj: any): string {
    return JSON.stringify(obj, (key, value) => {
      if (value === null || value === undefined) {
        return undefined;
      }
      return value;
    });
  }
}

export type AzureOpenAIConfiguration = {
  onCompletion?: (text: string) => Promise<void>;
  onError?: (error: any) => Promise<void>;
};

export type ChatCompletionRequestMessageRoleEnum =
  | "system"
  | "user"
  | "assistant";

export interface ChatCompletionRequestMessage {
  role: ChatCompletionRequestMessageRoleEnum;
  content: string;
}
export type CreateChatCompletionRequestStop = Array<string> | string;

export type CreateChatCompletionRequest = {
  messages: Array<ChatCompletionRequestMessage>;
  temperature?: number | null;
  top_p?: number | null;
  n?: number | null;
  stream?: boolean | null;
  stop?: CreateChatCompletionRequestStop;
  max_tokens?: number;
  presence_penalty?: number | null;
  frequency_penalty?: number | null;
  logit_bias?: object | null;
  user?: string;
};
