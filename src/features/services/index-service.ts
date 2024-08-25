import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { IndexContainer } from "@/features/database/cosmos-containers"
import { IndexEntity, TenantEntity } from "@/features/database/entities"
import { IndexModel } from "@/features/models/index-models"
import { TenantIndexConfig } from "@/features/models/tenant-models"

export const GetPublicIndexes = async (): ServerActionResponseAsync<IndexModel[]> => {
  try {
    const container = await IndexContainer()
    const { resources } = await container.items
      .query<IndexEntity>({ query: "SELECT * FROM c WHERE c.isPublic = true ORDER BY c.createdOn ASC" })
      .fetchAll()
    return {
      status: "OK",
      response: resources.length ? resources.map(publicIndexMapper) : [],
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}
export const GetIndexes = async (): ServerActionResponseAsync<IndexModel[]> => {
  try {
    const container = await IndexContainer()
    const { resources } = await container.items
      .query<IndexEntity>({ query: "SELECT * FROM c ORDER BY c.createdOn ASC" })
      .fetchAll()
    return {
      status: "OK",
      response: resources.length ? resources.map(publicIndexMapper) : [],
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

const publicIndexMapper = (resource: IndexEntity): IndexModel => ({
  id: resource.indexId,
  name: resource.name,
  description: resource.description,
  enabled: resource.enabled,
  isPublic: resource.isPublic,
})

export const GetTenantIndex = async (
  index: TenantEntity["indexes"][0]
): ServerActionResponseAsync<TenantIndexConfig> => {
  try {
    const container = await IndexContainer()
    const { resources } = await container.items
      .query<IndexEntity>({
        query: "SELECT * FROM c WHERE c.indexId = @indexId",
        parameters: [{ name: "@indexId", value: index.id }],
      })
      .fetchAll()

    if (!resources.length) throw new Error(`Index not found with id: ${index.id}`)
    return {
      status: "OK",
      response: {
        indexId: resources[0].indexId,
        name: resources[0].name,
        description: resources[0].description,
        enabled: index.enabled,
        accessGroups: index.accessGroups,
      },
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const GetTenantIndexes = async (
  indexes: TenantEntity["indexes"]
): ServerActionResponseAsync<TenantIndexConfig[]> => {
  try {
    if (!indexes.length) return { status: "OK", response: [] }
    const container = await IndexContainer()
    const { resources } = await container.items
      .query<IndexEntity>({
        query: `SELECT * FROM c WHERE c.indexId IN (${indexes.map(i => `"${i.id}"`).join(", ")})`,
      })
      .fetchAll()

    if (!resources.length) throw new Error(`Indexes not found with ids: ${indexes.map(i => i.id).join(", ")}`)
    return {
      status: "OK",
      response: resources.reduce((acc, curr) => {
        const index = indexes.find(i => i.id === curr.indexId)
        if (!index) return acc
        acc.push({
          indexId: curr.indexId,
          name: curr.name,
          description: curr.description,
          accessGroups: index.accessGroups,
          enabled: index.enabled,
        })
        return acc
      }, [] as TenantIndexConfig[]),
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}
