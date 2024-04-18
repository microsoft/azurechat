export type UserIdentity = {
  id: string
  userId: string
  tenantId: string
  email: string | null | undefined
  name: string | null | undefined
  upn: string
  qchatAdmin: boolean
}

export type UserActivity = {
  last_login: Date | null | undefined
  first_login: Date | null | undefined
  accepted_terms: boolean | null | undefined
  accepted_terms_date: string | null | undefined
  history?: string[]
  groups?: string[] | null | undefined
  failed_login_attempts: number
  last_failed_login: Date | null
}

export type UserPreferences = {
  contextPrompt: string
  history?: {
    updatedOn: string
    setting: string
    value: string
  }[]
}

export type UserRecord = UserIdentity &
  UserActivity & {
    preferences?: UserPreferences
  }
