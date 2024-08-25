export interface UserIdentity {
  userId: string
  tenantId: string
  email: string
  name: string
  upn: string
  admin: boolean
  /** @deprecated use admin instead */
  qchatAdmin?: boolean
  tenantAdmin: boolean
  globalAdmin: boolean
}

export interface UserActivity {
  last_login?: Date | null
  first_login?: Date | null
  accepted_terms?: boolean
  accepted_terms_date?: string
  groups: string[]
  failed_login_attempts: number
  last_failed_login: Date | null
  last_version_seen: string | null
}

export interface UserPreferences {
  contextPrompt: string
  /** @deprecated relocated activity tracking */
  history?: {
    updatedOn: string
    setting: string
    value: string
  }[]
}

export interface UserRecord extends UserIdentity, UserActivity {
  id: string
  preferences?: UserPreferences
  /** @deprecated relocated activity tracking */
  history?: string[]
}

export interface UserConfig {
  // smartTools: SmartTool[]
  // features: Feature[]
  // indexes: Index[]
}
