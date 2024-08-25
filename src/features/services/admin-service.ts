import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import {
  FeatureContainer,
  IndexContainer,
  SmartToolContainer,
  TenantContainer,
} from "@/features/database/cosmos-containers"
import { FeatureEntity, IndexEntity, SmartToolEntity, TenantEntity } from "@/features/database/entities"
import { FeatureModel } from "@/features/models/feature-models"
import { IndexModel } from "@/features/models/index-models"
import { SmartToolModel } from "@/features/models/smart-tool-models"

export const UpdateSmartTool = async (smartTool: SmartToolModel): ServerActionResponseAsync<void> => {
  try {
    const container = await SmartToolContainer()
    const { resources } = await container.items
      .query<SmartToolEntity>({
        query: "SELECT * FROM c WHERE c.smartToolId = @smartToolId",
        parameters: [{ name: "@smartToolId", value: smartTool.id }],
      })
      .fetchAll()

    const timestamp = new Date().toISOString()
    const updatedSmartTool: SmartToolEntity = {
      ...resources[0],
      createdOn: resources[0]?.createdOn || timestamp,
      updatedOn: timestamp,
      smartToolId: smartTool.id,
      name: smartTool.name,
      description: smartTool.description,
      enabled: smartTool.enabled,
      template: smartTool.template,
      isPublic: smartTool.isPublic,
    }
    await container.items.upsert<SmartToolEntity>(updatedSmartTool)

    await Promise.all([updateTenantsWithSmartTool(smartTool), updateSmartToolStatusForTenants(smartTool)])
    return { status: "OK", response: undefined }
  } catch (error) {
    return { status: "ERROR", errors: [{ message: `${error}` }] }
  }
}

export const DeleteSmartTool = async (smartToolId: string): ServerActionResponseAsync<void> => {
  try {
    const container = await SmartToolContainer()
    const { resources } = await container.items
      .query<SmartToolEntity>({
        query: "SELECT * FROM c WHERE c.smartToolId = @smartToolId",
        parameters: [{ name: "@smartToolId", value: smartToolId }],
      })
      .fetchAll()

    const smartTool = resources[0]
    await container.item(smartTool.id, smartTool.smartToolId).delete()

    const tenantContainer = await TenantContainer()
    const { resources: tenants } = await tenantContainer.items
      .query<TenantEntity>({
        query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.smartTools, { "id": @smartToolId }, true)',
      })
      .fetchAll()

    for (const tenant of tenants) {
      tenant.smartTools = tenant.smartTools.filter(tst => tst.id !== smartToolId)
      await tenantContainer.items.upsert<TenantEntity>(tenant)
    }
    return { status: "OK", response: undefined }
  } catch (error) {
    return { status: "ERROR", errors: [{ message: `${error}` }] }
  }
}

export const UpdateFeature = async (feature: FeatureModel): ServerActionResponseAsync<void> => {
  try {
    const container = await FeatureContainer()
    const { resources } = await container.items
      .query<FeatureEntity>({
        query: "SELECT * FROM c WHERE c.featureId = @featureId",
        parameters: [{ name: "@featureId", value: feature.id }],
      })
      .fetchAll()

    const timestamp = new Date().toISOString()
    const updatedFeature: FeatureEntity = {
      ...resources[0],
      createdOn: resources[0]?.createdOn || timestamp,
      updatedOn: timestamp,
      featureId: feature.id,
      name: feature.name,
      description: feature.description,
      enabled: feature.enabled,
      isPublic: feature.isPublic,
    }
    await container.items.upsert(updatedFeature)

    await Promise.all([updateTenantsWithFeature(feature), updateFeatureStatusForTenants(feature)])
    return { status: "OK", response: undefined }
  } catch (error) {
    return { status: "ERROR", errors: [{ message: `${error}` }] }
  }
}

export const DeleteFeature = async (featureId: string): ServerActionResponseAsync<void> => {
  try {
    const container = await FeatureContainer()
    const { resources } = await container.items
      .query<FeatureEntity>({
        query: "SELECT * FROM c WHERE c.featureId = @featureId",
        parameters: [{ name: "@featureId", value: featureId }],
      })
      .fetchAll()

    const feature = resources[0]
    await container.item(feature.id, feature.featureId).delete()

    const tenantContainer = await TenantContainer()
    const { resources: tenants } = await tenantContainer.items
      .query<TenantEntity>({
        query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.features, { "id": @featureId }, true)',
      })
      .fetchAll()

    for (const tenant of tenants) {
      tenant.features = tenant.features.filter(tf => tf.id !== featureId)
      await tenantContainer.items.upsert<TenantEntity>(tenant)
    }
    return { status: "OK", response: undefined }
  } catch (error) {
    return { status: "ERROR", errors: [{ message: `${error}` }] }
  }
}

export const UpdateIndex = async (index: IndexModel): ServerActionResponseAsync<void> => {
  try {
    const container = await IndexContainer()
    const { resources } = await container.items
      .query<IndexEntity>({
        query: "SELECT * FROM c WHERE c.indexId = @indexId",
        parameters: [{ name: "@indexId", value: index.id }],
      })
      .fetchAll()

    const timestamp = new Date().toISOString()
    const updatedIndex: IndexEntity = {
      ...resources[0],
      createdOn: resources[0]?.createdOn || timestamp,
      updatedOn: timestamp,
      indexId: index.id,
      name: index.name,
      description: index.description,
      enabled: index.enabled,
      isPublic: index.isPublic,
    }
    await container.items.upsert(updatedIndex)

    await Promise.all([updateIndexStatusForTenants(index), updateTenantsWithIndex(index)])
    return { status: "OK", response: undefined }
  } catch (error) {
    return { status: "ERROR", errors: [{ message: `${error}` }] }
  }
}

export const DeleteIndex = async (indexId: string): ServerActionResponseAsync<void> => {
  try {
    const container = await IndexContainer()
    const { resources } = await container.items
      .query<IndexEntity>({
        query: "SELECT * FROM c WHERE c.indexId = @indexId",
        parameters: [{ name: "@indexId", value: indexId }],
      })
      .fetchAll()

    const index = resources[0]
    await container.item(index.id, index.indexId).delete()

    const tenantContainer = await TenantContainer()
    const { resources: tenants } = await tenantContainer.items
      .query<TenantEntity>({
        query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.indexes, { "id": @indexId }, true)',
      })
      .fetchAll()

    for (const tenant of tenants) {
      tenant.indexes = tenant.indexes.filter(ti => ti.id !== indexId)
      await tenantContainer.items.upsert<TenantEntity>(tenant)
    }
    return { status: "OK", response: undefined }
  } catch (error) {
    return { status: "ERROR", errors: [{ message: `${error}` }] }
  }
}

/**
 * if smart tool is public, update all tenants with this smart tool
 * @param smartTool
 * @returns
 */
async function updateTenantsWithSmartTool(smartTool: SmartToolModel): Promise<void> {
  if (!smartTool.isPublic) return
  const tenantContainer = await TenantContainer()
  const query = { query: "SELECT * FROM c WHERE IS_NULL(c.dateOffBoarded) ORDER BY c.departmentName ASC" }
  const { resources: tenants } = await tenantContainer.items.query<TenantEntity>(query).fetchAll()

  for (const tenant of tenants) {
    if (!tenant.smartTools) tenant.smartTools = []
    const existingTenantSmartTool = tenant.smartTools.find(tst => tst.id === smartTool.id)
    if (!existingTenantSmartTool) {
      tenant.smartTools.push({
        id: smartTool.id,
        name: smartTool.name,
        enabled: false,
        accessGroups: [],
        template: smartTool.template,
      })
    }
    await tenantContainer.items.upsert<TenantEntity>(tenant)
  }
}

/**
 * if smart tool is disabled, disable all tenants with this smart tool
 * @param smartTool
 * @returns
 */
async function updateSmartToolStatusForTenants(smartTool: SmartToolModel): Promise<void> {
  if (smartTool.enabled) return
  const tenantContainer = await TenantContainer()
  const { resources: tenants } = await tenantContainer.items
    .query<TenantEntity>({
      query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.smartTools, { "id": @smartToolId }, true)',
      parameters: [{ name: "@smartToolId", value: smartTool.id }],
    })
    .fetchAll()

  for (const tenant of tenants) {
    const tenantSmartTool = tenant.smartTools.find(tst => tst.id === smartTool.id)
    if (tenantSmartTool) {
      tenant.smartTools = tenant.smartTools.map(tst =>
        tst.id === smartTool.id ? { ...tst, enabled: smartTool.enabled } : tst
      )
      await tenantContainer.items.upsert<TenantEntity>(tenant)
    }
  }
}

/**
 * if feature is public, update all tenants with this feature
 * @param feature
 * @returns
 */
async function updateTenantsWithFeature(feature: FeatureModel): Promise<void> {
  if (!feature.isPublic) return
  const tenantContainer = await TenantContainer()
  const query = { query: "SELECT * FROM c WHERE IS_NULL(c.dateOffBoarded) ORDER BY c.departmentName ASC" }
  const { resources: tenants } = await tenantContainer.items.query<TenantEntity>(query).fetchAll()

  for (const tenant of tenants) {
    if (!tenant.features) tenant.features = []
    const existingTenantFeature = tenant.features.find(tf => tf.id === feature.id)
    if (!existingTenantFeature) {
      tenant.features.push({
        id: feature.id,
        enabled: false,
        accessGroups: [],
      })
    }
    await tenantContainer.items.upsert<TenantEntity>(tenant)
  }
}

/**
 * if feature is disabled, disable all tenants with this feature
 * @param feature
 * @returns
 */
const updateFeatureStatusForTenants = async (feature: FeatureModel): Promise<void> => {
  if (feature.enabled) return
  const tenantContainer = await TenantContainer()
  const { resources: tenants } = await tenantContainer.items
    .query<TenantEntity>({
      query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.features, { "id": @featureId }, true)',
      parameters: [{ name: "@featureId", value: feature.id }],
    })
    .fetchAll()

  for (const tenant of tenants) {
    const tenantFeature = tenant.features.find(tf => tf.id === feature.id)
    if (tenantFeature) {
      tenant.features = tenant.features.map(tf => (tf.id === feature.id ? { ...tf, enabled: feature.enabled } : tf))
      await tenantContainer.items.upsert<TenantEntity>(tenant)
    }
  }
}

/**
 * if index is public, update all tenants with this index
 * @param index
 * @returns
 */
async function updateTenantsWithIndex(index: IndexModel): Promise<void> {
  if (!index.isPublic) return
  const tenantContainer = await TenantContainer()
  const query = { query: "SELECT * FROM c WHERE IS_NULL(c.dateOffBoarded) ORDER BY c.departmentName ASC" }
  const { resources: tenants } = await tenantContainer.items.query<TenantEntity>(query).fetchAll()

  for (const tenant of tenants) {
    if (!tenant.indexes) tenant.indexes = []
    const existingTenantIndex = tenant.indexes.find(ti => ti.id === index.id)
    if (!existingTenantIndex) {
      tenant.indexes.push({
        id: index.id,
        enabled: index.enabled,
        accessGroups: [],
      })
    }
    await tenantContainer.items.upsert<TenantEntity>(tenant)
  }
}

/**
 * if index is disabled, disable all tenants with this index
 * @param index
 * @returns
 */
async function updateIndexStatusForTenants(index: IndexModel): Promise<void> {
  if (index.enabled) return
  const tenantContainer = await TenantContainer()
  const { resources: tenants } = await tenantContainer.items
    .query<TenantEntity>({
      query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.indexes, { "id": @indexId }, true)',
      parameters: [{ name: "@indexId", value: index.id }],
    })
    .fetchAll()

  for (const tenant of tenants) {
    const tenantIndex = tenant.indexes.find(ti => ti.id === index.id)
    if (tenantIndex) {
      tenant.indexes = tenant.indexes.map(ti => (ti.id === index.id ? { ...ti, enabled: index.enabled } : ti))
      await tenantContainer.items.upsert<TenantEntity>(tenant)
    }
  }
}
