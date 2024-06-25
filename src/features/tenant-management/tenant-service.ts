import { getTenantId, userHashedId, userSession } from "@/features/auth/helpers"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { TenantContainer } from "@/features/common/services/cosmos"
import {
  SmartToolConfig,
  TenantConfig,
  TenantDetails,
  TenantPreferences,
  TenantRecord,
} from "@/features/tenant-management/models"
import { arraysAreEqual } from "@/lib/utils"

export const GetTenantById = async (tenantId: string): ServerActionResponseAsync<TenantRecord> => {
  try {
    const query = {
      query: "SELECT * FROM c WHERE c.tenantId = @tenantId",
      parameters: [{ name: "@tenantId", value: tenantId }],
    }
    const container = await TenantContainer()
    const { resources } = await container.items.query<TenantRecord>(query).fetchAll()
    if (!resources[0])
      return {
        status: "NOT_FOUND",
        errors: [{ message: `Tenant with id ${tenantId} not found` }],
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

export const CreateTenant = async (tenant: TenantRecord, userUpn: string): ServerActionResponseAsync<void> => {
  try {
    if (!tenant.tenantId) throw new Error("Tenant must have a tenantId to be created.")

    const container = await TenantContainer()

    await container.items.create<TenantRecord>({
      ...tenant,
      id: tenant.tenantId,
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      createdBy: userUpn,
      modifiedBy: userUpn,
      requiresGroupLogin: tenant.requiresGroupLogin,
    })
    return {
      status: "OK",
      response: undefined,
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}

export const UpdateTenant = async (tenant: TenantRecord): ServerActionResponseAsync<void> => {
  try {
    if (!tenant.id) throw new Error("Tenant must have an id to be updated.")

    const container = await TenantContainer()
    const tenantResponse = await GetTenantById(tenant.id)

    if (tenantResponse.status !== "OK") throw tenantResponse
    const oldTenant = tenantResponse.response

    const currentUser = await userHashedId()
    const updateTimestamp = new Date().toISOString()

    // update tenant history
    const keysToTrack: (keyof TenantRecord)[] = [
      "primaryDomain",
      "email",
      "supportEmail",
      "dateOnBoarded",
      "dateOffBoarded",
      "groups",
      "departmentName",
      "administrators",
      "features",
      "serviceTier",
      "requiresGroupLogin",
    ]
    for (const k of keysToTrack) {
      const key: keyof TenantRecord = k
      if (
        (Array.isArray(oldTenant[key]) &&
          Array.isArray(tenant[key]) &&
          arraysAreEqual(oldTenant[key] as [], tenant[key] as [])) ||
        oldTenant[key] === tenant[key]
      )
        continue
      tenant.history = [
        ...(oldTenant.history || []),
        `${updateTimestamp}: ${key} changed from ${oldTenant[key]} to ${tenant[key]} by ${currentUser}`,
      ]
    }

    // update tenant preferences history
    for (const k in tenant.preferences) {
      const key = k as keyof TenantPreferences
      if (key === "history" || oldTenant.preferences?.[key] === tenant.preferences[key]) continue
      ;(tenant.preferences || { history: [] }).history = [
        ...(oldTenant.preferences?.history || []),
        {
          updatedBy: currentUser,
          updatedOn: updateTimestamp,
          setting: key,
          value: JSON.stringify(tenant.preferences[key]),
        },
      ]
    }

    await container.items.upsert({ ...oldTenant, ...tenant })
    return {
      status: "OK",
      response: undefined,
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}

export const GetTenantDetails = async (): ServerActionResponseAsync<TenantDetails> => {
  const user = await userSession()
  if (!user) return { status: "ERROR", errors: [{ message: "User not found" }] }

  const existingTenantResult = await GetTenantById(user.tenantId)
  if (existingTenantResult.status !== "OK") return existingTenantResult

  const tenantDetails: TenantDetails = {
    id: existingTenantResult.response.id,
    primaryDomain: existingTenantResult.response.primaryDomain || "",
    supportEmail: existingTenantResult.response.supportEmail,
    departmentName: existingTenantResult.response.departmentName || "",
    administrators: existingTenantResult.response.administrators,
    groups: existingTenantResult.response.groups || [],
    preferences: existingTenantResult.response.preferences || { contextPrompt: "" },
    requiresGroupLogin: existingTenantResult.response.requiresGroupLogin,
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

export const GetTenantToolConfig = async (tenantId: string): ServerActionResponseAsync<SmartToolConfig[]> => {
  const tenantResponse = await GetTenantById(tenantId)
  if (tenantResponse.status !== "OK") return tenantResponse
  return {
    status: "OK",
    response: tenantResponse.response.smartTools || [],
  }
}

export const UpdateTenantToolConfig = async (
  tenantId: string,
  tool: SmartToolConfig
): ServerActionResponseAsync<void> => {
  try {
    const tenantResponse = await GetTenantById(tenantId)
    if (tenantResponse.status !== "OK") return tenantResponse
    const existingTools = tenantResponse.response.smartTools || []
    const updatedTools = existingTools.map(t => (t.name === tool.name ? tool : t))
    const container = await TenantContainer()
    await container.items.upsert({ ...tenantResponse.response, smartTools: updatedTools })
    return {
      status: "OK",
      response: undefined,
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}

export const GetTenantConfig = async (): ServerActionResponseAsync<TenantConfig> => {
  const tenantId = await getTenantId()
  const tenant = await GetTenantById(tenantId)
  if (tenant.status !== "OK")
    return {
      status: "ERROR",
      errors: [{ message: "Tenant not found" }],
    }
  return {
    status: "OK",
    response: {
      systemPrompt: process.env.NEXT_PUBLIC_SYSTEM_PROMPT || "",
      contextPrompt: tenant.response.preferences?.contextPrompt || "",
      groups: tenant.response.groups || [],
      administrators: tenant.response.administrators || [],
      requiresGroupLogin: tenant.response.requiresGroupLogin,
      supportEmail: tenant.response.supportEmail,
      departmentName: tenant.response.departmentName || "",
      email: tenant.response.email || "",
      tools: tenant.response.smartTools || [],
    },
  }
}

export const GetTenants = async (): ServerActionResponseAsync<TenantRecord[]> => {
  const user = await userSession()
  if (!user) return { status: "ERROR", errors: [{ message: "User not found" }] }
  if (!user.admin) return { status: "ERROR", errors: [{ message: "Permission Denied - User is not an admin" }] }

  try {
    const query = { query: "SELECT * FROM c WHERE c.dateOffBoarded = null ORDER BY c.departmentName ASC" }
    const container = await TenantContainer()
    const { resources } = await container.items.query<TenantRecord>(query).fetchAll()
    return {
      status: "OK",
      response: resources,
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}
