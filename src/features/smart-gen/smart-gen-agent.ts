import { SmartGenRequest, SmartGenTools, SupportedSmartGenTools, SupportedSmartGenToolId } from "./models"
import { contextPromptSanitiser, templateFormatter } from "./tools"

export type SmartGenToolAgentConfig = {
  id: string
  name: string
  enabled: boolean
  template: string
  description: string
}[]
type SmartGenToolAgent = {
  execute: (request: SmartGenRequest) => Promise<string>
}
export default function SmartGenToolAgent(config: SmartGenToolAgentConfig): SmartGenToolAgent {
  const availableSmartGenTools: SmartGenTools = config
    .filter(tool => tool.enabled && SupportedSmartGenTools.includes(tool.id as SupportedSmartGenToolId))
    .map(tool => {
      switch (tool.id) {
        case "contextPromptSanitiser":
          return { id: tool.id, execute: contextPromptSanitiser(tool.template) }
        case "formatToImprove":
        case "formatToSimplify":
        case "formatToExplain":
        case "checkTranscription":
          return { id: tool.id, execute: templateFormatter(tool.template) }
        default:
          throw new Error("Tool not found")
      }
    })
    .reduce((acc, tool) => ({ ...acc, [tool.id]: tool }), {} as SmartGenTools)

  return {
    execute: async (request: SmartGenRequest): Promise<string> =>
      await availableSmartGenTools[request.toolId].execute(request.input),
  }
}
