export type TenantRecord = {
  readonly id: string
  readonly tenantId: string
  primaryDomain: string | null | undefined
  email: string | null | undefined
  supportEmail: string
  dateCreated: string | null | undefined
  dateUpdated: string | null | undefined
  dateOnBoarded: Date | null | undefined
  dateOffBoarded: Date | null | undefined
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
}

export type TenantPreferences = {
  contextPrompt: string
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
  preferences: TenantPreferences
}
