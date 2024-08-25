import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { SmartToolContainer } from "@/features/database/cosmos-containers"
import { SmartToolEntity, TenantEntity } from "@/features/database/entities"
import { SmartToolModel } from "@/features/models/smart-tool-models"
import { TenantSmartToolConfig } from "@/features/models/tenant-models"

export const GetPublicSmartTools = async (): ServerActionResponseAsync<SmartToolModel[]> => {
  try {
    const container = await SmartToolContainer()
    const { resources } = await container.items
      .query<SmartToolEntity>({ query: "SELECT * FROM c WHERE c.isPublic = true ORDER BY c.createdOn ASC" })
      .fetchAll()
    return {
      status: "OK",
      response: resources.length
        ? resources.map(st => ({
            id: st.smartToolId,
            name: st.name,
            description: st.description,
            enabled: st.enabled,
            template: st.template,
            isPublic: st.isPublic,
          }))
        : [],
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const GetSmartTools = async (): ServerActionResponseAsync<SmartToolModel[]> => {
  try {
    const container = await SmartToolContainer()
    const { resources } = await container.items
      .query<SmartToolEntity>({ query: "SELECT * FROM c ORDER BY c.createdOn ASC" })
      .fetchAll()
    return {
      status: "OK",
      response: resources.length
        ? resources.map(st => ({
            id: st.smartToolId,
            name: st.name,
            description: st.description,
            enabled: st.enabled,
            template: st.template,
            isPublic: st.isPublic,
          }))
        : [],
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const GetTenantSmartTool = async (
  smartTool: TenantEntity["smartTools"][0]
): ServerActionResponseAsync<TenantSmartToolConfig> => {
  try {
    const container = await SmartToolContainer()
    const { resources } = await container.items
      .query<SmartToolEntity>({
        query: "SELECT * FROM c WHERE c.smartToolId = @smartToolId",
        parameters: [{ name: "@smartToolId", value: smartTool.id }],
      })
      .fetchAll()

    if (!resources.length) throw new Error(`Smart tool not found with id: ${smartTool.id}`)
    return {
      status: "OK",
      response: {
        smartToolId: resources[0].smartToolId,
        name: resources[0].name,
        description: resources[0].description,
        enabled: smartTool.enabled,
        template: smartTool.template,
        accessGroups: smartTool.accessGroups,
      },
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const GetTenantSmartTools = async (
  tenantSmartTools: TenantEntity["smartTools"]
): ServerActionResponseAsync<TenantSmartToolConfig[]> => {
  try {
    if (!tenantSmartTools.length) return { status: "OK", response: [] }
    const container = await SmartToolContainer()
    const { resources } = await container.items
      .query<SmartToolEntity>({
        query: `SELECT * FROM c WHERE c.smartToolId IN (${tenantSmartTools.map(tst => `"${tst.id || tst.name || ""}"`).join(", ")})`,
      })
      .fetchAll()
    const smartTools = resources.reduce((acc, curr) => {
      const tenantSmartTool = tenantSmartTools.find(tst => tst.id === curr.smartToolId || tst.name === curr.smartToolId)
      if (!tenantSmartTool) return acc
      acc.push({
        smartToolId: curr.smartToolId,
        name: curr.name,
        description: curr.description,
        enabled: tenantSmartTool.enabled,
        template: tenantSmartTool.template,
        accessGroups: tenantSmartTool.accessGroups,
      })
      return acc
    }, [] as TenantSmartToolConfig[])
    return { status: "OK", response: smartTools }
  } catch (error) {
    return { status: "ERROR", errors: [{ message: `${error}` }] }
  }
}
