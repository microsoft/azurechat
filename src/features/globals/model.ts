export type ApplicationSettings = {
  applicationId: string
  name: string
  description: string
  version: string
  termsAndConditionsDate: string
  administratorAccess: TenantGroupPairs[]
  transcriptionAccess: TenantGroupPairs[]
}

export type TenantGroupPairs = {
  tenant: string
  groups: string[]
}
