import * as yup from "yup"

import { getTenantId, userSession } from "@/features/auth/helpers"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { TenantContainer } from "@/features/database/cosmos-containers"
import { TenantEntity } from "@/features/database/entities"
import logger from "@/features/insights/app-insights"
import { FeatureModel } from "@/features/models/feature-models"
import { IndexModel } from "@/features/models/index-models"
import { SmartToolModel } from "@/features/models/smart-tool-models"
import {
  TenantApplicationConfig,
  TenantConfig,
  TenantDetails,
  TenantPreferences,
  TenantSmartToolConfig,
} from "@/features/models/tenant-models"
import { activityTrackingService } from "@/features/services/activity-tracking-service"
import { GetTenantApplication } from "@/features/services/application-service"
import { GetPublicFeatures, GetTenantFeatures } from "@/features/services/feature-service"
import { GetPublicIndexes, GetTenantIndexes } from "@/features/services/index-service"
import { GetPublicSmartTools, GetTenantSmartTools } from "@/features/services/smart-tools-service"
import { arraysAreEqual } from "@/lib/utils"

function mapToTenantEntity(entity: TenantEntity): TenantEntity {
  return {
    ...entity,
    application: {
      ...entity.application,
      id: process.env.APPLICATION_ID,
    },
    smartTools: (entity.smartTools || []).map(st => ({
      id: st.id || st.name || "",
      enabled: st.enabled,
      accessGroups: st.accessGroups || [],
      template: st.template,
    })),
    features: (entity.features || []).map(f => ({
      id: f.id,
      enabled: f.enabled,
      accessGroups: f.accessGroups || [],
    })),
    indexes: (entity.indexes || []).map(i => ({
      id: i.id,
      enabled: i.enabled,
      accessGroups: i.accessGroups || [],
    })),
    preferences: { contextPrompt: "" },
  }
}

/** @deprecated */
export const GetTenantById = async (tenantId: string): ServerActionResponseAsync<TenantEntity> => {
  try {
    const query = {
      query: "SELECT * FROM c WHERE c.tenantId = @tenantId",
      parameters: [{ name: "@tenantId", value: tenantId }],
    }
    const container = await TenantContainer()
    const { resources } = await container.items.query<TenantEntity>(query).fetchAll()
    if (!resources[0])
      return {
        status: "NOT_FOUND",
        errors: [{ message: `Tenant with id ${tenantId} not found` }],
      }
    return {
      status: "OK",
      response: mapToTenantEntity(resources[0]),
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}

export const CheckGroupsForTenant = async (
  tenantId: string,
  groupsString: string
): ServerActionResponseAsync<boolean> => {
  try {
    const tenantResponse = await GetTenantById(tenantId)
    if (tenantResponse.status !== "OK") return tenantResponse
    if (!tenantResponse.response)
      return {
        status: "OK",
        response: false,
      }

    const groupsToCheck = groupsString.split(",").map(group => group.trim())
    return {
      status: "OK",
      response: groupsToCheck.some(group => (tenantResponse.response.groups ?? []).includes(group)),
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}

const createTenantRequestSchema = yup
  .object({
    tenantId: yup.string().required(),
    primaryDomain: yup.string().required(),
    email: yup.string().email().required(),
    supportEmail: yup.string().email().required(),
    departmentName: yup.string().required(),
    administrators: yup.array().of(yup.string().required()).required(),
    serviceTier: yup.string().required(),
    requiresGroupLogin: yup.boolean().required(),
  })
  .noUnknown(true, "Attempted to update invalid fields")

type CreateTenantRequest = yup.InferType<typeof createTenantRequestSchema>
export const CreateTenant = async (request: CreateTenantRequest, userUpn: string): ServerActionResponseAsync<void> => {
  try {
    const validatedRequest = await createTenantRequestSchema.validate(request, {
      abortEarly: false,
      stripUnknown: true,
    })

    const smartTools = await getPublicSmartTools()
    const features = await getPublicFeatures()
    const indexes = await getPublicIndexes()

    const container = await TenantContainer()
    const { resource } = await container.items.create<TenantEntity>({
      ...validatedRequest,
      id: request.tenantId,
      groups: [],
      application: {
        id: process.env.APPLICATION_ID,
        enabled: true,
        accessGroups: [],
      },
      smartTools: smartTools.map(st => ({ ...st, accessGroups: [] })),
      features: features.map(f => ({ ...f, accessGroups: [] })),
      indexes: indexes.map(i => ({ ...i, accessGroups: [] })),
      preferences: { contextPrompt: "" },
      dateOnBoarded: new Date().toISOString(),
      dateOffBoarded: null,
      createdOn: new Date().toISOString(),
      updatedOn: new Date().toISOString(),
      createdBy: userUpn,
      modifiedBy: userUpn,
    })
    if (!resource) throw new Error("Tenant could not be created.")

    return {
      status: "OK",
      response: undefined,
    }
  } catch (e) {
    const errorMessage = JSON.stringify(e instanceof yup.ValidationError ? { errors: e.errors } : e)
    return {
      status: "ERROR",
      errors: [{ message: `${errorMessage}` }],
    }
  }
}

async function getPublicSmartTools(): Promise<SmartToolModel[]> {
  const smartToolsResponse = await GetPublicSmartTools()
  let smartTools: SmartToolModel[] = []
  if (smartToolsResponse.status !== "OK") logger.error("Failed to get smart tools for tenant creation")
  else smartTools = smartToolsResponse.response
  return smartTools.filter(st => st.enabled)
}

async function getPublicFeatures(): Promise<FeatureModel[]> {
  const featuresResponse = await GetPublicFeatures()
  let features: FeatureModel[] = []
  if (featuresResponse.status !== "OK") logger.error("Failed to get features for tenant creation")
  else features = featuresResponse.response
  return features.filter(f => f.enabled)
}

async function getPublicIndexes(): Promise<IndexModel[]> {
  const indexesResponse = await GetPublicIndexes()
  let indexes: IndexModel[] = []
  if (indexesResponse.status !== "OK") logger.error("Failed to get indexes for tenant creation")
  else indexes = indexesResponse.response
  return indexes.filter(i => i.enabled)
}

const updateTenantRequestSchema = yup
  .object({
    id: yup.string().required(),
    administrators: yup
      .array()
      .of(
        yup
          .string()
          .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid tenant admin email")
          .required()
      )
      .optional(),
    groups: yup
      .array()
      .of(
        yup
          .string()
          .matches(/^[a-fA-F0-9-]{36}$/, "Invalid group GUID")
          .required()
      )
      .optional(),
    preferences: yup.object({ contextPrompt: yup.string().max(500).optional() }).optional(),
    requiresGroupLogin: yup.boolean().optional(),
  })
  .noUnknown(true, "Attempted to update invalid fields")
type UpdateTenantRequest = yup.InferType<typeof updateTenantRequestSchema>
export const UpdateTenant = async (request: UpdateTenantRequest): ServerActionResponseAsync<void> => {
  try {
    const validatedRequest = await updateTenantRequestSchema.validate(request, {
      abortEarly: false,
      stripUnknown: true,
    })
    const tenantResponse = await GetTenantById(validatedRequest.id)

    if (tenantResponse.status !== "OK") throw tenantResponse
    const existing = tenantResponse.response

    const user = await userSession()
    if (!user) throw new Error("User session not found")

    const update: TenantEntity = {
      ...existing,
      groups: validatedRequest.groups || existing.groups,
      administrators: validatedRequest.administrators || existing.administrators,
      requiresGroupLogin:
        validatedRequest.requiresGroupLogin !== undefined
          ? validatedRequest.requiresGroupLogin
          : existing.requiresGroupLogin,
      preferences: validatedRequest.preferences
        ? { ...existing.preferences, ...validatedRequest.preferences }
        : existing.preferences,
      updatedOn: new Date().toISOString(),
      modifiedBy: user.upn,
    }

    await trackActivityUpdates(existing, update)

    const container = await TenantContainer()
    await container.items.upsert<TenantEntity>({ ...update })
    return {
      status: "OK",
      response: undefined,
    }
  } catch (e) {
    const errorMessage = JSON.stringify(e instanceof yup.ValidationError ? { errors: e.errors } : e)
    return {
      status: "ERROR",
      errors: [{ message: `${errorMessage}` }],
    }
  }
}

export const GetTenantDetails = async (): ServerActionResponseAsync<TenantDetails> => {
  const user = await userSession()
  if (!user) return { status: "ERROR", errors: [{ message: "User not found" }] }
  return GetTenantDetailsById(user.tenantId)
}

export const GetTenantDetailsById = async (tenantId: string): ServerActionResponseAsync<TenantDetails> => {
  const existingTenantResult = await GetTenantById(tenantId)
  if (existingTenantResult.status !== "OK") return existingTenantResult
  const existingTenant = existingTenantResult.response

  const tenantSmartToolsResult = await GetTenantSmartTools(existingTenantResult.response.smartTools)
  if (tenantSmartToolsResult.status !== "OK") return tenantSmartToolsResult
  const tenantSmartTools = tenantSmartToolsResult.response

  const tenantDetails: TenantDetails = {
    id: existingTenant.id,
    tenantId: existingTenant.tenantId,
    primaryDomain: existingTenant.primaryDomain,
    email: existingTenant.email,
    supportEmail: existingTenant.supportEmail,
    departmentName: existingTenant.departmentName,
    dateOnBoarded: existingTenant.dateOnBoarded,
    dateOffBoarded: existingTenant.dateOffBoarded,
    administrators: existingTenant.administrators,
    requiresGroupLogin: existingTenant.requiresGroupLogin,
    groups: existingTenant.groups,
    preferences: existingTenant.preferences || { contextPrompt: "" },
    smartTools: tenantSmartTools,
  }
  return { status: "OK", response: tenantDetails }
}

export const GetTenantPreferences = async (): ServerActionResponseAsync<TenantPreferences> => {
  const user = await userSession()
  if (!user) return { status: "ERROR", errors: [{ message: "User not found" }] }

  const existingTenantResult = await GetTenantById(user.tenantId)
  if (existingTenantResult.status !== "OK") return existingTenantResult

  const preferences: TenantPreferences = existingTenantResult.response.preferences || { contextPrompt: "" }
  return { status: "OK", response: preferences }
}

export const GetTenantToolConfig = async (tenantId: string): ServerActionResponseAsync<TenantSmartToolConfig[]> => {
  const tenantResponse = await GetTenantById(tenantId)
  if (tenantResponse.status !== "OK") return tenantResponse
  const tenant = tenantResponse.response
  const toolConfigResult = await GetTenantSmartTools(tenant.smartTools)
  if (toolConfigResult.status !== "OK") return toolConfigResult
  return {
    status: "OK",
    response: toolConfigResult.response,
  }
}

const updateTenantConfigSchema = yup
  .object({
    id: yup.string().required(),
    enabled: yup.boolean().required(),
    template: yup.string().required(),
    accessGroups: yup.array().of(yup.string().required()).required(),
  })
  .noUnknown(true, "Attempted to update tenant config invalid fields")
type UpdateTenantConfigRequest = yup.InferType<typeof updateTenantConfigSchema>
export const UpdateTenantToolConfig = async (
  tenantId: string,
  request: UpdateTenantConfigRequest
): ServerActionResponseAsync<void> => {
  try {
    const tool = await updateTenantConfigSchema.validate(request, {
      abortEarly: false,
      stripUnknown: true,
    })
    const [tenantResponse, user] = await Promise.all([GetTenantById(tenantId), userSession()])
    if (tenantResponse.status !== "OK") return tenantResponse
    if (!user) throw new Error("User session not found")

    const existingTenant: TenantEntity = {
      ...tenantResponse.response,
      updatedOn: new Date().toISOString(),
      modifiedBy: user.upn,
    }
    const updatedTools = existingTenant.smartTools.map(t => (t.id === tool.id ? tool : t))
    const container = await TenantContainer()
    await container.items.upsert<TenantEntity>({ ...existingTenant, smartTools: updatedTools })
    return { status: "OK", response: undefined }
  } catch (e) {
    const errorMessage = JSON.stringify(e instanceof yup.ValidationError ? { errors: e.errors } : e)
    return { status: "ERROR", errors: [{ message: `${errorMessage}` }] }
  }
}

export const GetTenantConfig = async (): ServerActionResponseAsync<TenantConfig> => {
  const tenantId = await getTenantId()
  const tenantResult = await GetTenantById(tenantId)

  if (tenantResult.status !== "OK") throw tenantResult
  const tenant = tenantResult.response

  const [toolsResult, featuresResult, indexesResult, applicationResult] = await Promise.all([
    GetTenantSmartTools(tenant.smartTools),
    GetTenantFeatures(tenant.features),
    GetTenantIndexes(tenant.indexes),
    GetTenantApplication(tenant.application),
  ])
  if (toolsResult.status !== "OK") throw toolsResult
  if (featuresResult.status !== "OK") throw featuresResult
  if (indexesResult.status !== "OK") throw indexesResult
  if (applicationResult.status !== "OK") throw applicationResult

  return {
    status: "OK",
    response: {
      systemPrompt: process.env.NEXT_PUBLIC_SYSTEM_PROMPT || "",
      contextPrompt: tenant.preferences?.contextPrompt || "",
      groups: tenant.groups,
      administrators: tenant.administrators,
      requiresGroupLogin: tenant.requiresGroupLogin,
      supportEmail: tenant.supportEmail,
      departmentName: tenant.departmentName || "",
      email: tenant.email || "",
      tools: toolsResult.response,
      features: featuresResult.response,
      indexes: indexesResult.response,
      app: applicationResult.response,
    },
  }
}

export const GetTenants = async (): ServerActionResponseAsync<TenantDetails[]> => {
  const user = await userSession()
  if (!user) return { status: "ERROR", errors: [{ message: "User not found" }] }
  if (!user.admin) return { status: "ERROR", errors: [{ message: "Permission Denied - User is not an admin" }] }

  try {
    const query = { query: "SELECT * FROM c WHERE IS_NULL(c.dateOffBoarded) ORDER BY c.departmentName ASC" }
    const container = await TenantContainer()
    const { resources } = await container.items.query<TenantEntity>(query).fetchAll()

    const tenantsTools: TenantEntity["smartTools"] = resources.reduce(
      (acc, curr) => {
        const seen = acc.map(t => t.id)
        const tenantTools = curr.smartTools.filter(tst => !seen.includes(tst.id))
        acc.push(...tenantTools)
        return acc
      },
      [] as TenantEntity["smartTools"]
    )
    const tenantSmartToolsResult = await GetTenantSmartTools(tenantsTools)
    const response: TenantDetails[] = resources.reduce((acc, curr) => {
      if (tenantSmartToolsResult.status !== "OK") return acc
      const tenantSmartTools: TenantSmartToolConfig[] = curr.smartTools.reduce((acc, curr) => {
        const tool = tenantSmartToolsResult.response.find(t => t.smartToolId === curr.id)
        if (tool)
          acc.push({
            smartToolId: tool.smartToolId,
            name: tool.name,
            description: tool.description,
            enabled: curr.enabled,
            accessGroups: curr.accessGroups,
            template: curr.template,
          })
        return acc
      }, [] as TenantSmartToolConfig[])
      acc.push({
        ...curr,
        smartTools: tenantSmartTools,
      })
      return acc
    }, [] as TenantDetails[])
    return {
      status: "OK",
      response,
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}

export const GetTenantApplicationConfig = async (
  tenantId: string
): ServerActionResponseAsync<TenantApplicationConfig> => {
  try {
    const tenantResponse = await GetTenantById(tenantId)
    if (tenantResponse.status !== "OK") throw tenantResponse.errors
    const tenant = tenantResponse.response
    const appConfigResult = await GetTenantApplication(tenant.application)
    if (appConfigResult.status !== "OK") throw appConfigResult.errors

    return {
      status: "OK",
      response: appConfigResult.response,
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}

async function trackActivityUpdates(oldTenant: TenantEntity, tenant: TenantEntity): Promise<void> {
  try {
    const user = await userSession()
    if (!user) throw new Error("User not found")

    const updateTimestamp = new Date().toISOString()
    const keysToTrack: (keyof TenantEntity)[] = [
      "primaryDomain",
      "email",
      "supportEmail",
      "dateOnBoarded",
      "dateOffBoarded",
      "groups",
      "departmentName",
      "administrators",
      "features",
      "requiresGroupLogin",
    ]
    for (const k of keysToTrack) {
      const key: keyof TenantEntity = k
      if (
        (Array.isArray(oldTenant[key]) &&
          Array.isArray(tenant[key]) &&
          arraysAreEqual(oldTenant[key] as [], tenant[key] as [])) ||
        oldTenant[key] === tenant[key]
      )
        continue
      await activityTrackingService.logActivity(
        "UPDATE",
        { id: tenant.id, type: "TenantEntity", tenantId: tenant.tenantId },
        `${updateTimestamp}: ${key} changed from ${oldTenant[key]} to ${tenant[key]} by ${user.upn}`,
        user.userId
      )
    }

    for (const k in tenant.preferences) {
      const key = k as keyof TenantPreferences
      if (oldTenant.preferences?.[key] === tenant.preferences[key]) continue
      await activityTrackingService.logActivity(
        "UPDATE",
        { id: tenant.id, type: "TenantEntity", tenantId: tenant.id },
        `${updateTimestamp}: ${key} changed from ${oldTenant.preferences[key]} to ${tenant.preferences[key]} by ${user.upn}`,
        user.userId
      )
    }
  } catch (err) {
    logger.error("Error tracking tenant activity updates", { error: err })
  }
}
