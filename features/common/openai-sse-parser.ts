export class OpenAISSEParser {
  private controller: ReadableStreamDefaultController;

  constructor(controller: ReadableStreamDefaultController) {
    this.controller = controller;
  }

  public parseSSE(input: string): string {
    let pos = 0;
    let data = "";
    let completeResponse = "";

    while (pos < input.length) {
      const lineEnd = input.indexOf("\n", pos);
      if (lineEnd === -1) {
        break;
      }

      const line = input.slice(pos, lineEnd).trim();
      pos = lineEnd + 1;

      if (line.startsWith("data:")) {
        const eventData = line.slice(5).trim();

        if (eventData === "[DONE]") {
          this.controller.close();
          break;
        } else {
          data += eventData;
        }
      } else if (line === "") {
        if (data) {
          completeResponse += this.processEvent(data);
          data = "";
        }
      }
    }

    return completeResponse;
  }

  private processEvent(data: string): string {
    try {
      const json = JSON.parse(data);
      const text = json.choices[0].delta?.content || "";
      const queue = new TextEncoder().encode(text);
      this.controller.enqueue(queue);
      return text;
    } catch (e) {
      this.controller.close();
      this.controller.error(e);
    }

    return "";
  }
}
