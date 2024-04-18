import { userHashedId } from "@/features/auth/helpers"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { TenantContainer } from "@/features/common/services/cosmos"
import { arraysAreEqual } from "@/lib/utils"

import { TenantPreferences, TenantRecord } from "./models"

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
          value: tenant.preferences[key],
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
