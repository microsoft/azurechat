export type TenantRecord = {
  readonly id: string
  readonly tenantId: string
  primaryDomain: string | null | undefined
  email: string | null | undefined
  supportEmail: string
  dateCreated: string | null | undefined
  dateUpdated: string | null | undefined
  dateOnBoarded: string | null | undefined
  dateOffBoarded: string | null | undefined
  modifiedBy: string | null | undefined
  createdBy: string | null | undefined
  departmentName: string | null | undefined
  groups: string[]
  administrators: string[]
  features: string[]
  serviceTier: string | null | undefined
  history?: string[]
  requiresGroupLogin: boolean
  preferences?: TenantPreferences
  smartTools?: { name: string; enabled: boolean; template: string }[]
}

export type TenantPreferences = {
  contextPrompt: string
  customReferenceFields?: { name: CustomReferenceFieldNames; pattern: RegExp; label: string }[]
  history?: {
    updatedBy: string
    updatedOn: string
    setting: string
    value: string
  }[]
}

export type TenantDetails = {
  readonly primaryDomain: string
  supportEmail: string
  departmentName: string
  administrators: string[]
  requiresGroupLogin: boolean
  groups: string[]
  preferences: TenantPreferences
}

export type CustomReferenceFieldNames = "internalReference"

export type TenantConfig = {
  systemPrompt: string
  contextPrompt: string
  groups: string[]
  administrators: string[]
  departmentName: string
  requiresGroupLogin: boolean
  supportEmail: string
  email: string
  tools: { name: string; enabled: boolean; template: string }[]
}
