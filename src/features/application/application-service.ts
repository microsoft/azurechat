import { User } from "next-auth"
import { AdapterUser } from "next-auth/adapters"

import { APP_DESCRIPTION, APP_NAME, APP_VERSION } from "@/app-global"

import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { ApplicationContainer } from "@/features/common/services/cosmos"
import { AdministratorTenantGroups, ApplicationSettings } from "@/features/globals/model"

export const GetApplicationSettings = async (): ServerActionResponseAsync<ApplicationSettings> => {
  try {
    if (!process.env.APPLICATION_ID) throw new Error("APPLICATION_ID not set")
    const query = {
      query: "SELECT * FROM c WHERE c.applicationId = @applicationId",
      parameters: [{ name: "@applicationId", value: process.env.APPLICATION_ID }],
    }
    const container = await ApplicationContainer()
    const { resources } = await container.items.query<ApplicationSettings>(query).fetchAll()
    if (!resources[0]) {
      const { resource } = await container.items.upsert<ApplicationSettings>({
        applicationId: process.env.APPLICATION_ID,
        name: APP_NAME,
        description: APP_DESCRIPTION,
        version: APP_VERSION,
        termsAndConditionsDate: new Date().toISOString(),
        administratorAccess: [],
      })
      if (!resource)
        return {
          status: "ERROR",
          errors: [{ message: "Application settings not created" }],
        }
      return {
        status: "OK",
        response: resource,
      }
    }
    return {
      status: "OK",
      response: resources[0],
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}

export async function isAdmin(user: User | AdapterUser): Promise<boolean> {
  try {
    const appSettingsResponse = await GetApplicationSettings()
    if (appSettingsResponse.status !== "OK") return false
    const appSettings = appSettingsResponse.response
    const administratorAccess: AdministratorTenantGroups[] = appSettings.administratorAccess || []

    const tenantAccess = administratorAccess.find(access => access.tenant === user.tenantId)

    if (!tenantAccess) {
      return false
    }

    const isAdmin = tenantAccess.group.some(group => user.groups.includes(group))

    return isAdmin
  } catch (_error) {
    return false
  }
}
