import { userHashedId } from "@/features/auth/helpers"
import { TenantContainer } from "@/features/common/services/cosmos"
import { ServerActionResponseAsync } from "../common/server-action-response"

export type TenantRecord = {
  readonly id: string
  readonly tenantId: string
  primaryDomain: string | null | undefined
  email: string | null | undefined
  supportEmail: string | null | undefined
  dateCreated: string | null | undefined
  dateUpdated: string | null | undefined
  dateOnBoarded: Date | null | undefined
  dateOffBoarded: Date | null | undefined
  modifiedBy: string | null | undefined
  createdBy: string | null | undefined
  departmentName: string | null | undefined
  groups: string[] | null | undefined
  administrators: string[] | null | undefined
  features: string[] | null | undefined
  serviceTier: string | null | undefined
  history?: string[]
  requiresGroupLogin: boolean
  [key: string]: unknown
}

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
    console.error(e)
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
    console.error(e)
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
    const { resource } = await container.item(tenant.id).read<TenantRecord>()

    if (!resource)
      return {
        status: "NOT_FOUND",
        errors: [{ message: `Tenant with id ${tenant.id} not found` }],
      }

    if (!resource.history) resource.history = []

    const currentUser = await userHashedId()
    const changes: string[] = []
    const updateTimestamp = new Date().toISOString()
    Object.entries(tenant).forEach(([key, newValue]) => {
      const oldValue = resource[key]
      if (newValue !== oldValue && key !== "history") {
        changes.push(`${updateTimestamp}: ${key} changed from ${oldValue} to ${newValue} by ${currentUser}`)
      }
    })

    const updatedHistory = [...resource.history, ...changes]

    const updatedTenant = {
      ...resource,
      ...tenant,
      history: updatedHistory,
      dateUpdated: updateTimestamp,
    }

    await container.items.upsert(updatedTenant)
    return {
      status: "OK",
      response: undefined,
    }
  } catch (e) {
    console.error(e)
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}
