export type SmartGenModel<K extends SupportedSmartGenToolId = SupportedSmartGenToolId> = {
  id?: string
  action: SupportedSmartGenToolId
  context: Record<string, unknown>
  output: Awaited<ReturnType<SmartGenTools[K]["execute"]>>
}

export type SmartGenEntity = SmartGenModel<SupportedSmartGenToolId> & {
  tenantId: string
  userId: string
  createdAt: string
}

export type SmartGenRequest = {
  input: string
  toolId: SupportedSmartGenToolId
  context: Record<string, unknown> & { uiComponent: string }
}

export const SupportedSmartGenTools = [
  "contextPromptSanitiser",
  "formatToImprove",
  "formatToSimplify",
  "formatToExplain",
  "checkTranscription",
] as const

export type SupportedSmartGenToolId = (typeof SupportedSmartGenTools)[number]

export type SmartGenTool = {
  name: SupportedSmartGenToolId
  execute: (request: string) => Promise<string>
}

export type SmartGenTools = Record<SupportedSmartGenToolId, SmartGenTool>
