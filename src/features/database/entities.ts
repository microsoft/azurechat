interface Entity {
  id: string
  createdOn: string
  updatedOn: string
}

export interface ApplicationEntity extends Entity {
  applicationId: string
  name: string
  description: string
  version: string
  termsAndConditionsDate: string
  /** @deprecated */
  administratorAccess: TenantGroupPairs[]
  /** @deprecated */
  transcriptionAccess: TenantGroupPairs[]
  /** @deprecated */
  indexes: IndexEntity[]
}

/** @deprecated */
export type TenantGroupPairs = {
  tenant: string
  groups: string[]
}

export interface FeatureEntity extends Entity {
  featureId: string
  name: string
  description: string
  enabled: boolean
  isPublic: boolean
}

export interface SmartToolEntity extends Entity {
  smartToolId: string
  name: string
  description: string
  enabled: boolean
  template: string
  isPublic: boolean
}

export interface TenantEntity extends Entity {
  tenantId: string
  primaryDomain: string | null
  email: string | null
  supportEmail: string
  dateOnBoarded: string | null
  dateOffBoarded: string | null
  createdBy: string | null
  modifiedBy: string | null
  departmentName: string | null
  groups: string[]
  administrators: UserEntity["email"][]
  serviceTier: string | null
  requiresGroupLogin: boolean
  application: {
    id: ApplicationEntity["applicationId"]
    enabled: boolean
    accessGroups: string[]
  }
  smartTools: {
    id: SmartToolEntity["smartToolId"]
    /** @deprecated */
    name?: string
    enabled: boolean
    accessGroups: string[]
    template: string
  }[]
  features: {
    id: FeatureEntity["featureId"]
    enabled: boolean
    accessGroups: string[]
  }[]
  indexes: {
    id: IndexEntity["indexId"]
    enabled: boolean
    accessGroups: string[]
  }[]
  preferences: {
    contextPrompt: string
    customReferenceFields?: { name: "internalReference"; pattern: RegExp; label: string }[]
    /** @deprecated relocated activity tracking */
    history?: {
      updatedBy: string
      updatedOn: string
      setting: string
      value: string
    }
  }
  /** @deprecated replaced by createdOn */
  dateCreated?: string | null | undefined
  /** @deprecated replaced by updatedOn */
  dateUpdated?: string | null | undefined
  /** @deprecated relocated activity tracking */
  history?: string[]
}

export interface UserEntity extends Entity {
  userId: string
  tenantId: TenantEntity["tenantId"]
  email: string
  name: string
  upn: string
  admin: boolean
  /** @deprecated use admin instead */
  qchatAdmin?: boolean
  tenantAdmin: boolean
  /** Indicates a higher level of tenantAdmin. */
  globalAdmin: boolean
  preferences: {
    contextPrompt: string
    /** @deprecated relocated activity tracking */
    history?: {
      updatedOn: string
      setting: string
      value: string
    }[]
  }
  last_login?: Date
  first_login?: Date
  accepted_terms?: boolean
  accepted_terms_date?: string
  groups: string[]
  failed_login_attempts: number
  last_failed_login: Date | null
  last_version_seen: string | null
  /** @deprecated relocated activity tracking */
  history?: string[]
}

export interface IndexEntity extends Entity {
  indexId: string
  name: string
  description: string
  enabled: boolean
  isPublic: boolean
  /** @deprecated */
  tenantAccess: TenantGroupPairs[]
}
