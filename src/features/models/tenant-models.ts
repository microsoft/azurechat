import { SmartToolEntity, TenantEntity } from "@/features/database/entities"

export type CustomReferenceFieldNames = "internalReference"

export interface TenantPreferences {
  contextPrompt: string
  customReferenceFields?: { name: CustomReferenceFieldNames; pattern: RegExp; label: string }[]
}

export interface TenantDetails {
  readonly id: string
  readonly tenantId: string
  primaryDomain: string | null
  email: string | null
  supportEmail: string
  dateOnBoarded: string | null
  dateOffBoarded: string | null
  departmentName: string | null
  groups: string[]
  administrators: string[]
  requiresGroupLogin: boolean
  preferences: TenantPreferences
  smartTools: TenantSmartToolConfig[]
}

export interface TenantApplicationConfig {
  applicationId: string
  name: string
  description: string
  enabled: boolean
  accessGroups: string[]
}

export interface TenantSmartToolConfig {
  smartToolId: string
  name: string
  description: string
  enabled: boolean
  accessGroups: string[]
  template: string
}

export interface TenantFeatureConfig {
  featureId: string
  name: string
  description: string
  enabled: boolean
  accessGroups: string[]
}

export interface TenantIndexConfig {
  indexId: string
  name: string
  description: string
  enabled: boolean
  accessGroups: string[]
}

export interface TenantProfile {
  departmentName: string
  groups: string[]
  administrators: string[]
  systemPrompt: string
  contextPrompt: string
  requiresGroupLogin: boolean
  supportEmail: string
  email: string
  tools: TenantSmartToolConfig[]
}

export interface TenantRecord {
  readonly id: string
  readonly tenantId: string
  primaryDomain: string | null
  email: string | null
  supportEmail: string
  dateOnBoarded: string | null
  dateOffBoarded: string | null
  departmentName: string | null
  groups: string[]
  administrators: string[]
  requiresGroupLogin: boolean
  app: TenantApplicationConfig
  smartTools: TenantSmartToolConfig[]
  features: TenantFeatureConfig[]
  indexes: TenantIndexConfig[]
}

export interface TenantConfig {
  systemPrompt: string
  contextPrompt: string
  groups: string[]
  administrators: string[]
  departmentName: string
  requiresGroupLogin: boolean
  supportEmail: string
  email: string
  app: TenantApplicationConfig
  tools: TenantSmartToolConfig[]
  features: TenantFeatureConfig[]
  indexes: TenantIndexConfig[]
}

export const toTenantDetails = (tenant: TenantEntity, tools: SmartToolEntity[]): TenantDetails => ({
  ...tenant,
  id: tenant.id,
  primaryDomain: tenant.primaryDomain || "",
  supportEmail: tenant.supportEmail,
  departmentName: tenant.departmentName || "",
  administrators: tenant.administrators,
  groups: tenant.groups || [],
  preferences: tenant.preferences || { contextPrompt: "" },
  requiresGroupLogin: tenant.requiresGroupLogin,
  smartTools: tools?.map(toSmartToolConfig) || [],
})

export const toSmartToolConfig = (tool: SmartToolEntity): TenantSmartToolConfig => ({
  smartToolId: tool.smartToolId,
  accessGroups: [],
  name: tool.name,
  description: tool.description,
  enabled: tool.enabled,
  template: tool.template,
})
