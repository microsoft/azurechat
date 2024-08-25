import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { FeatureContainer } from "@/features/database/cosmos-containers"
import { FeatureEntity, TenantEntity } from "@/features/database/entities"
import { FeatureModel } from "@/features/models/feature-models"
import { TenantFeatureConfig } from "@/features/models/tenant-models"

export const GetPublicFeatures = async (): ServerActionResponseAsync<FeatureModel[]> => {
  try {
    const container = await FeatureContainer()
    const { resources } = await container.items
      .query<FeatureEntity>({
        query: "SELECT * FROM c WHEREE c.enabled = true AND c.isPublic = true ORDER BY c.createdOn ASC",
      })
      .fetchAll()
    return {
      status: "OK",
      response: resources.length ? resources.map(publicFeatureMapper) : [],
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const GetFeatures = async (): ServerActionResponseAsync<FeatureModel[]> => {
  try {
    const container = await FeatureContainer()
    const { resources } = await container.items
      .query<FeatureEntity>({ query: "SELECT * FROM c ORDER BY c.createdOn ASC" })
      .fetchAll()
    return {
      status: "OK",
      response: resources.length ? resources.map(publicFeatureMapper) : [],
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

const publicFeatureMapper = (resource: FeatureEntity): FeatureModel => ({
  id: resource.featureId,
  name: resource.name,
  description: resource.description,
  enabled: resource.enabled,
  isPublic: resource.isPublic,
})

export const GetTenantFeature = async (
  feature: TenantEntity["features"][0]
): ServerActionResponseAsync<TenantFeatureConfig> => {
  try {
    const container = await FeatureContainer()
    const { resources } = await container.items
      .query<FeatureEntity>({
        query: "SELECT * FROM c WHERE c.featureId = @featureId",
        parameters: [{ name: "@featureId", value: feature.id }],
      })
      .fetchAll()

    if (!resources.length) throw new Error(`Feature not found with id: ${feature.id}`)
    return {
      status: "OK",
      response: {
        featureId: resources[0].featureId,
        name: resources[0].name,
        description: resources[0].description,
        enabled: feature.enabled,
        accessGroups: feature.accessGroups,
      },
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const GetTenantFeatures = async (
  tenantFeatures: TenantEntity["features"]
): ServerActionResponseAsync<TenantFeatureConfig[]> => {
  try {
    if (!tenantFeatures.length) return { status: "OK", response: [] }
    const container = await FeatureContainer()
    const { resources } = await container.items
      .query<FeatureEntity>({
        query: `SELECT * FROM c WHERE c.featureId IN (${tenantFeatures.map(f => `"${f.id}"`).join(", ")})`,
      })
      .fetchAll()

    if (!resources.length) throw new Error(`No features found with ids: ${tenantFeatures.map(f => f.id).join(", ")}`)
    return {
      status: "OK",
      response: resources.reduce((acc, curr) => {
        const tenantFeature = tenantFeatures.find(tf => tf.id === curr.featureId)
        if (!tenantFeature) return acc
        acc.push({
          featureId: curr.featureId,
          name: curr.name,
          description: curr.description,
          enabled: tenantFeature.enabled,
          accessGroups: tenantFeature.accessGroups,
        })
        return acc
      }, [] as TenantFeatureConfig[]),
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}
