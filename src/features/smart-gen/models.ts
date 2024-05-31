export type SmartGenModel = {
  id: string
  action: string
  context: Record<string, unknown>
  output: string
}

export type SmartGenEntity = SmartGenModel & {
  tenantId: string
  userId: string
}
