import * as yup from "yup"

import { CONTEXT_PROMPT_DEFAULT } from "@/app-global"

import { hashValue, userSession } from "@/features/auth/helpers"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { UserContainer } from "@/features/database/cosmos-containers"
import { UserEntity } from "@/features/database/entities"
import logger from "@/features/insights/app-insights"
import { UserPreferences, UserRecord } from "@/features/models/user-models"
import { activityTrackingService } from "@/features/services/activity-tracking-service"

const toUserRecord = (entity: UserEntity): UserRecord => ({
  id: entity.id,
  userId: entity.userId,
  tenantId: entity.tenantId,
  email: entity.email,
  name: entity.name,
  upn: entity.upn,
  admin: !!(entity.admin || entity.qchatAdmin),
  groups: entity.groups,
  tenantAdmin: entity.tenantAdmin,
  globalAdmin: entity.globalAdmin,
  preferences: entity.preferences || { contextPrompt: CONTEXT_PROMPT_DEFAULT },
  first_login: entity.first_login,
  last_login: entity.last_login,
  failed_login_attempts: entity.failed_login_attempts,
  last_failed_login: entity.last_failed_login,
  last_version_seen: entity.last_version_seen,
})

const createUserRequestSchema = yup.object({
  tenantId: yup.string().required(),
  email: yup.string().required(),
  name: yup.string().required(),
  upn: yup.string().required(),
  admin: yup.boolean().required(),
  groups: yup.array().of(yup.string().required()).required(),
  globalAdmin: yup.boolean().required(),
  tenantAdmin: yup.boolean().required(),
})
type CreateUserRequest = yup.InferType<typeof createUserRequestSchema>
export const CreateUser = async (request: CreateUserRequest): ServerActionResponseAsync<UserRecord> => {
  try {
    const user = await createUserRequestSchema.validate(request, { abortEarly: false, stripUnknown: true })
    const now = new Date()
    const container = await UserContainer()
    const id = hashValue(user.upn)
    const { resource } = await container.items.create<UserEntity>({
      ...user,
      id,
      userId: user.upn,
      first_login: now,
      last_login: now,
      failed_login_attempts: 0,
      last_failed_login: null,
      preferences: { contextPrompt: CONTEXT_PROMPT_DEFAULT },
      createdOn: now.toISOString(),
      updatedOn: now.toISOString(),
      last_version_seen: null,
    })
    if (!resource)
      return {
        status: "ERROR",
        errors: [{ message: "User could not be created." }],
      }

    await activityTrackingService.logActivity(
      "CREATE",
      { id, type: "UserEntity", tenantId: user.tenantId },
      `${now.toISOString()}: User created by ${user.upn}`,
      user.upn
    )
    return {
      status: "OK",
      response: toUserRecord(resource),
    }
  } catch (error) {
    const errorMessage = JSON.stringify(error instanceof yup.ValidationError ? { errors: error.errors } : error)
    return {
      status: "ERROR",
      errors: [{ message: `${errorMessage}` }],
    }
  }
}

const updateUserRequestSchema = yup.object({
  failed_login_attempts: yup.number().optional(),
  last_version_seen: yup.string().optional(),
  accepted_terms: yup.boolean().optional(),
  preferences: yup.object({ contextPrompt: yup.string().optional().default("") }).optional(),
})
type UpdateUserRequest = yup.InferType<typeof updateUserRequestSchema>
export const UpdateUser = async (
  tenantId: string,
  userId: string,
  request: UpdateUserRequest
): ServerActionResponseAsync<UserRecord> => {
  try {
    if (!tenantId?.trim() || !userId?.trim()) throw new Error("TenantId and UserID are required to update a user.")

    const validatedRequest = await updateUserRequestSchema.validate(request, { abortEarly: false, stripUnknown: true })

    const existingUserResult = await GetUserById(tenantId, userId)
    if (existingUserResult.status !== "OK") throw existingUserResult

    const existingUser = existingUserResult.response
    const updateTimestamp = new Date()

    const update: UserEntity = {
      ...existingUser,
      admin: !!(existingUser.admin || existingUser.qchatAdmin),
      failed_login_attempts: validatedRequest.failed_login_attempts ?? existingUser.failed_login_attempts,
      last_version_seen: validatedRequest.last_version_seen ?? existingUser.last_version_seen,
      accepted_terms: validatedRequest.accepted_terms ?? existingUser.accepted_terms,
      accepted_terms_date: validatedRequest.accepted_terms
        ? updateTimestamp.toISOString()
        : existingUser.accepted_terms_date,
      preferences: {
        contextPrompt: validatedRequest.preferences?.contextPrompt ?? (existingUser.preferences?.contextPrompt || ""),
      },
      last_login: updateTimestamp,
      updatedOn: updateTimestamp.toISOString(),
    }

    await trackActivityUpdates(existingUser, update, updateTimestamp.toISOString())

    const container = await UserContainer()
    const { resource } = await container.items.upsert<UserEntity>({ ...existingUser, ...request })
    if (!resource) {
      return {
        status: "ERROR",
        errors: [{ message: "User could not be updated." }],
      }
    }
    return {
      status: "OK",
      response: toUserRecord(resource),
    }
  } catch (e) {
    const errorMessage = JSON.stringify(e instanceof yup.ValidationError ? { errors: e.errors } : e)
    return {
      status: "ERROR",
      errors: [{ message: `${errorMessage}` }],
    }
  }
}

/** @deprecated use GetUserByUpn instead */
export const GetUserByUpnOld = async (tenantId: string, upn: string): ServerActionResponseAsync<UserEntity> => {
  const query = {
    query: "SELECT * FROM c WHERE c.tenantId = @tenantId AND c.upn = @upn",
    parameters: [
      { name: "@tenantId", value: tenantId },
      { name: "@upn", value: upn },
    ],
  }
  try {
    const container = await UserContainer()
    const { resources } = await container.items.query<UserEntity>(query).fetchAll()
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

export const GetUserByUpn = async (tenantId: string, upn: string): ServerActionResponseAsync<UserRecord> => {
  const query = {
    query: "SELECT * FROM c WHERE c.tenantId = @tenantId AND c.upn = @upn",
    parameters: [
      { name: "@tenantId", value: tenantId },
      { name: "@upn", value: upn },
    ],
  }
  try {
    const container = await UserContainer()
    const { resources } = await container.items.query<UserEntity>(query).fetchAll()
    if (!resources?.[0])
      return {
        status: "NOT_FOUND",
        errors: [{ message: `User with upn ${upn} not found` }],
      }
    return {
      status: "OK",
      response: toUserRecord(resources[0]),
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const GetUserPreferences = async (): ServerActionResponseAsync<UserPreferences> => {
  const user = await userSession()
  if (!user) return { status: "ERROR", errors: [{ message: "User not found" }] }

  const existingUserResult = await GetUserByUpn(user.tenantId, user.upn)
  if (existingUserResult.status !== "OK") return existingUserResult

  const preferences: UserPreferences = existingUserResult.response.preferences || { contextPrompt: "" }
  return { status: "OK", response: preferences }
}

export const GetUsersByTenantId = async (tenantId: string): ServerActionResponseAsync<UserRecord[]> => {
  const user = await userSession()
  if (!user) return { status: "ERROR", errors: [{ message: "User not found" }] }
  if (user.tenantId === tenantId && !(user.globalAdmin || user.tenantAdmin || user.admin))
    return { status: "ERROR", errors: [{ message: "Permission Denied - User is not an admin" }] }

  try {
    const query = {
      query: "SELECT * FROM c WHERE c.tenantId = @tenantId AND c.last_login != null ORDER BY c.name ASC",
      parameters: [{ name: "@tenantId", value: tenantId }],
    }
    const container = await UserContainer()
    const { resources } = await container.items.query<UserEntity>(query).fetchAll()
    return {
      status: "OK",
      response: resources.map(toUserRecord),
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}

/** @deprecated */
export const GetUserById = async (tenantId: string, userId: string): ServerActionResponseAsync<UserEntity> => {
  const query = {
    query: "SELECT * FROM c WHERE c.tenantId = @tenantId AND c.id = @userId",
    parameters: [
      { name: "@tenantId", value: tenantId },
      { name: "@userId", value: userId },
    ],
  }
  try {
    const container = await UserContainer()
    const { resources } = await container.items.query<UserEntity>(query).fetchAll()
    if (!resources?.[0])
      return {
        status: "NOT_FOUND",
        errors: [{ message: `User with upn ${userId} not found` }],
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

async function trackActivityUpdates(oldUser: UserEntity, user: UserEntity, updateTimestamp: string): Promise<void> {
  try {
    const keysToTrack: (keyof UserEntity)[] = [
      "email",
      "name",
      "upn",
      "admin",
      "tenantAdmin",
      "globalAdmin",
      "first_login",
      "accepted_terms_date",
    ]
    for (const key of keysToTrack) {
      if (oldUser[key] !== user[key]) {
        await activityTrackingService.logActivity(
          "UPDATE",
          { id: user.id, type: "UserEntity", tenantId: user.tenantId },
          `${updateTimestamp}: ${key} changed from ${oldUser[key]} to ${user[key]} by ${user.upn}`,
          user.id
        )
      }
    }
    for (const k in user.preferences) {
      const key = k as keyof UserPreferences
      if (oldUser.preferences?.[key] === user.preferences[key]) continue
      await activityTrackingService.logActivity(
        "UPDATE",
        { id: user.id, type: "UserEntity", tenantId: user.tenantId },
        `${updateTimestamp}: ${key} changed from ${oldUser.preferences[key]} to ${user.preferences[key]} by ${user.upn}`,
        user.id
      )
    }
  } catch (err) {
    logger.error("Error tracking user activity updates", { error: err })
  }
}
