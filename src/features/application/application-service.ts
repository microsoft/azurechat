import { APP_DESCRIPTION, APP_NAME, APP_VERSION } from "@/app-global"

import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { ApplicationContainer } from "@/features/common/services/cosmos"
import { ApplicationSettings } from "@/features/globals/model"

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
