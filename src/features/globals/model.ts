export type ApplicationSettings = {
  applicationId: string
  name: string
  description: string
  version: string
  termsAndConditionsDate: string
  administratorAccess: AdministratorTenantGroups[]
}

export type AdministratorTenantGroups = {
  tenant: string
  group: string[]
}
