export type SmartGenModel<K extends SmartGenToolName = SmartGenToolName> = {
  id?: string
  action: SmartGenToolName
  context: Record<string, unknown>
  output: Awaited<ReturnType<SmartGenTools[K]["execute"]>>
}

export type SmartGenEntity = SmartGenModel<SmartGenToolName> & {
  tenantId: string
  userId: string
  createdAt: string
}

export type SmartGenRequest = {
  input: string
  toolName: SmartGenToolName
  context: Record<string, unknown> & { uiComponent: string }
}

export const SmartGenToolNames = [
  "contextPromptSanitiser",
  "formatToImprove",
  "formatToSimplify",
  "formatToExplain",
  "checkTranscription",
] as const

export type SmartGenToolName = (typeof SmartGenToolNames)[number]

export type SmartGenTool = {
  name: SmartGenToolName
  execute: (request: string) => Promise<string>
}

export type SmartGenTools = Record<SmartGenToolName, SmartGenTool>
