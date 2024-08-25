import { APP_DESCRIPTION, APP_NAME, APP_VERSION } from "@/app-global"

import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { ApplicationContainer } from "@/features/database/cosmos-containers"
import { TenantEntity } from "@/features/database/entities"
import { ApplicationSettings } from "@/features/models/application-models"
import { TenantApplicationConfig } from "@/features/models/tenant-models"

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
        id: process.env.APPLICATION_ID,
        name: APP_NAME,
        description: APP_DESCRIPTION,
        version: APP_VERSION,
        termsAndConditionsDate: new Date().toISOString(),
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

export const GetTenantApplication = async (
  tenantApp: TenantEntity["application"]
): ServerActionResponseAsync<TenantApplicationConfig> => {
  try {
    const container = await ApplicationContainer()
    const { resources } = await container.items
      .query<TenantApplicationConfig>({
        query: "SELECT * FROM c WHERE c.applicationId = @applicationId",
        parameters: [{ name: "@applicationId", value: tenantApp.id }],
      })
      .fetchAll()
    if (!resources.length) throw new Error(`Tenant application not found with id: ${tenantApp.id}`)
    return {
      status: "OK",
      response: {
        applicationId: resources[0].applicationId,
        name: resources[0].name,
        description: resources[0].description,
        enabled: tenantApp.enabled,
        accessGroups: tenantApp.accessGroups,
      },
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}

// async function isAdmin(user: User | AdapterUser): Promise<boolean> {
//   try {
//     const [appSettingsResponse, tenantResponse] = await Promise.all([
//       GetApplicationSettings(),
//       GetTenantDetails(user.tenantId),
//     ])

//     if (appSettingsResponse.status !== "OK") {
//       return false
//     }

//     const appSettings: ApplicationSettings = appSettingsResponse.response

//     const administratorAccess: TenantGroupPairs[] = appSettings.administratorAccess || []

//     const tenantAccess = administratorAccess.find(access => access.tenant === user.tenantId)

//     if (!tenantAccess) {
//       return false
//     }

//     const isAdmin = tenantAccess.groups.some(group => user.groups?.includes(group))

//     return isAdmin
//   } catch (_error) {
//     return false
//   }
// }
