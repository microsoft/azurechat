import { SmartGenRequest, SmartGenTools, SmartGenToolNames, SmartGenToolName } from "./models"
import { contextPromptSanitiser, formatToImprove, formatToSimplify, formatToExplain, checkTranscription } from "./tools"

export type SmartToolConfig = {
  name: string
  enabled: boolean
  template: string
}

type SmartGenToolAgent = {
  execute: (request: SmartGenRequest) => Promise<string>
}
export default function SmartGenToolAgent(config: SmartToolConfig[]): SmartGenToolAgent {
  const availableSmartGenTools: SmartGenTools = config
    .filter(tool => tool.enabled && SmartGenToolNames.includes(tool.name as SmartGenToolName))
    .map(tool => {
      switch (tool.name) {
        case "contextPromptSanitiser":
          return { name: tool.name, execute: contextPromptSanitiser(tool.template) }
        case "formatToImprove":
          return { name: tool.name, execute: formatToImprove(tool.template) }
        case "formatToSimplify":
          return { name: tool.name, execute: formatToSimplify(tool.template) }
        case "formatToExplain":
          return { name: tool.name, execute: formatToExplain(tool.template) }
        case "checkTranscription":
          return { name: tool.name, execute: checkTranscription(tool.template) }
        default:
          throw new Error("Tool not found")
      }
    })
    .reduce((acc, tool) => ({ ...acc, [tool.name]: tool }), {} as SmartGenTools)

  return {
    execute: async (request: SmartGenRequest): Promise<string> =>
      await availableSmartGenTools[request.toolName].execute(request.input),
  }
}
