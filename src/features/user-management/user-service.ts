import { UserContainer } from "@/features/common/services/cosmos"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { hashValue } from "../auth/helpers"

export type UserIdentity = {
  id: string
  userId: string
  tenantId: string
  email: string | null | undefined
  name: string | null | undefined
  upn: string
  qchatAdmin: boolean
}

export type UserActivity = {
  last_login: Date | null | undefined
  first_login: Date | null | undefined
  accepted_terms: boolean | null | undefined
  accepted_terms_date: string | null | undefined
  history?: string[]
  groups?: string[] | null | undefined
  failed_login_attempts: number
  last_failed_login: Date | null
  contextPrompt?: string | null
  [key: string]: unknown
}

export type UserRecord = UserIdentity & UserActivity

export const CreateUser = async (user: UserRecord): ServerActionResponseAsync<UserRecord> => {
  user.failed_login_attempts = 0
  user.last_failed_login = null
  try {
    const container = await UserContainer()
    const creationDate = new Date().toISOString()
    const historyLog = `${creationDate}: User created by ${user.upn}`
    const { resource } = await container.items.create<UserRecord>({
      ...user,
      id: user.upn,
      history: [historyLog],
    })
    if (!resource)
      return {
        status: "ERROR",
        errors: [{ message: "User could not be created." }],
      }
    return {
      status: "OK",
      response: resource,
    }
  } catch (error) {
    // TODO
    console.error(error)
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const UpdateUser = async (
  tenantId: string,
  userId: string,
  user: UserRecord
): ServerActionResponseAsync<UserRecord> => {
  if (!tenantId?.trim() || !userId?.trim()) throw new Error("TenantId and UserID are required to update a user.")

  const updateTimestamp = new Date().toISOString()

  const oldUserResponse = await GetUserByUpn(tenantId, user.upn)
  const container = await UserContainer()

  if (oldUserResponse.status === "NOT_FOUND") {
    await container.items.upsert(user)
    return {
      status: "OK",
      response: user,
    }
  } else if (oldUserResponse.status === "OK") {
    const oldUser = oldUserResponse.response
    let historyUpdated = false
    const changes: string[] = oldUser.history || []

    Object.keys(user).forEach(key => {
      if (key !== "history" && key !== "last_login" && key !== "groups" && oldUser[key] !== user[key]) {
        changes.push(`${updateTimestamp}: ${key} changed from ${oldUser[key]} to ${user[key]} by ${user.upn}`)
        historyUpdated = true
      }
    })

    if (!arraysAreEqual(user.groups || [], oldUser.groups || [])) {
      user.groups = user.groups ? [...user.groups] : []
      user.groups = [...user.groups]
      historyUpdated = true
    }

    if (historyUpdated) {
      user.history = changes
    }

    user.last_login = new Date(updateTimestamp)

    const { resource } = await container.items.upsert<UserRecord>(user)
    if (!resource) {
      return {
        status: "ERROR",
        errors: [{ message: "User could not be updated." }],
      }
    }
    return {
      status: "OK",
      response: resource,
    }
  }

  return {
    status: "ERROR",
    errors: [{ message: "Unexpected error occurred while updating user." }],
  }
}

const arraysAreEqual = (array1: string[], array2: string[]): boolean => {
  if (array1.length !== array2.length) return false
  const sortedArray1 = [...array1].sort()
  const sortedArray2 = [...array2].sort()
  return sortedArray1.every((value, index) => value === sortedArray2[index])
}

export const GetUserByUpn = async (tenantId: string, upn: string): ServerActionResponseAsync<UserRecord> => {
  const query = {
    query: "SELECT * FROM c WHERE c.tenantId = @tenantId AND (c.upn = @upn OR c.upn = @hashUpn)",
    parameters: [
      { name: "@tenantId", value: tenantId },
      { name: "@upn", value: upn },
      { name: "@hashUpn", value: hashValue(upn) },
    ],
  }
  try {
    const container = await UserContainer()
    const { resources } = await container.items.query<UserRecord>(query).fetchAll()
    if (!resources?.[0])
      return {
        status: "NOT_FOUND",
        errors: [{ message: `User with upn ${upn} not found` }],
      }
    return {
      status: "OK",
      response: resources[0],
    }
  } catch (error) {
    // TODO
    console.error(error)
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}
