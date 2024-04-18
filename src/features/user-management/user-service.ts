import { hashValue } from "@/features/auth/helpers"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { UserContainer } from "@/features/common/services/cosmos"
import { arraysAreEqual } from "@/lib/utils"

import { UserPreferences, UserRecord } from "./models"

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

  const oldUserResponse = await GetUserByUpn(tenantId, user.upn)
  const container = await UserContainer()

  if (oldUserResponse.status === "NOT_FOUND") {
    await container.items.upsert(user)
    return {
      status: "OK",
      response: user,
    }
  }
  if (oldUserResponse.status === "OK") {
    const oldUser = oldUserResponse.response

    const updateTimestamp = new Date().toISOString()

    // update user history
    const keysToTrack: (keyof UserRecord)[] = [
      "email",
      "name",
      "upn",
      "qchatAdmin",
      "first_login",
      "accepted_terms_date",
    ]
    for (const key of keysToTrack) {
      if (oldUser[key] !== user[key]) {
        user.history = [
          ...(user.history || []),
          `${updateTimestamp}: ${key} changed from ${oldUser[key]} to ${user[key]} by ${user.upn}`,
        ]
      }
    }

    // update user preferences history
    for (const k in user.preferences) {
      const key = k as keyof UserPreferences
      if (key === "history" || oldUser.preferences?.[key] === user.preferences[key]) continue
      user.preferences.history = [
        ...(user.preferences.history || []),
        {
          updatedOn: updateTimestamp,
          setting: key,
          value: user.preferences[key],
        },
      ]
    }

    if (!arraysAreEqual(user.groups || [], oldUser.groups || [])) {
      user.groups = user.groups ? [...user.groups] : []
      user.groups = [...user.groups]
    }

    user.last_login = new Date(updateTimestamp)

    const { resource } = await container.items.upsert<UserRecord>({ ...oldUser, ...user })
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
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}
