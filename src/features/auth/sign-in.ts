import { User } from "next-auth"
import { AdapterUser } from "next-auth/adapters"

import { STATUS_UNAUTHORIZED, STATUS_ERROR, STATUS_NOT_FOUND, STATUS_OK, SUPPORT_EMAIL_PREFIX } from "@/app-global"

import logger from "@/features/insights/app-insights"
import { UserRecord } from "@/features/models/user-models"
import { CreateTenant, GetTenantById } from "@/features/services/tenant-service"
import { CreateUser, GetUserByUpn, UpdateUser } from "@/features/services/user-service"

export enum SignInErrorType {
  NotAuthorised = "notAuthorised",
  SignInFailed = "signInFailed",
}

type SignInSuccess = {
  success: true
}

type SignInError = {
  success: false
  errorCode: SignInErrorType
}

export type SignInResponse = SignInSuccess | SignInError

export class UserSignInHandler {
  static async handleSignIn(user: User | AdapterUser, userGroups: string[] = []): Promise<SignInResponse> {
    try {
      const admins = process.env.ADMIN_EMAIL_ADDRESS?.split(",").map(email => email.toLowerCase().trim()) || []
      const tenantResponse = await GetTenantById(user.tenantId)
      const userRecord = await getsertUser(userGroups, user)

      if (tenantResponse.status === STATUS_ERROR || tenantResponse.status === STATUS_UNAUTHORIZED)
        return { success: false, errorCode: SignInErrorType.NotAuthorised }

      if (tenantResponse.status === STATUS_NOT_FOUND) {
        const domain = user.upn?.split("@")[1] || ""

        const tenant = await CreateTenant(
          {
            tenantId: user.tenantId,
            primaryDomain: domain,
            email: user.upn,
            supportEmail: SUPPORT_EMAIL_PREFIX + domain,
            departmentName: "",
            administrators: admins,
            serviceTier: "",
            requiresGroupLogin: true,
          },
          user.upn
        )
        if (tenant.status !== STATUS_OK) throw tenant
        const updatedUser = await UpdateUser(user.tenantId, userRecord.id, { failed_login_attempts: 0 })

        if (updatedUser.status !== STATUS_OK) throw updatedUser
        return user.globalAdmin ? { success: true } : { success: false, errorCode: SignInErrorType.NotAuthorised }
      }

      if (tenantResponse.status !== STATUS_OK) throw tenantResponse
      const tenant = tenantResponse.response

      const userHasRequiredGroupAccess =
        !tenant.requiresGroupLogin || isUserInRequiredGroups(userGroups, tenant.groups || [])

      if (userHasRequiredGroupAccess) {
        const updatedUser = await UpdateUser(user.tenantId, userRecord.id, { failed_login_attempts: 0 })
        if (updatedUser.status !== STATUS_OK) throw updatedUser
        return { success: true }
      }

      const updatedUser = await UpdateUser(user.tenantId, userRecord.id, {
        failed_login_attempts: userRecord.failed_login_attempts + 1,
      })
      if (updatedUser.status !== STATUS_OK) throw updatedUser

      return { success: false, errorCode: SignInErrorType.NotAuthorised }
    } catch (error) {
      logger.error("Error signing in user", { error })
      return { success: false, errorCode: SignInErrorType.SignInFailed }
    }
  }
}

const isUserInRequiredGroups = (userGroups: string[], requiredGroups: string[]): boolean =>
  !!requiredGroups.length && requiredGroups.some(groupId => userGroups.includes(groupId))

const getsertUser = async (userGroups: string[], user: User | AdapterUser): Promise<UserRecord> => {
  try {
    const existingUserResponse = await GetUserByUpn(user.tenantId, user.upn ?? "")
    if (existingUserResponse.status === STATUS_NOT_FOUND) {
      const createUserResponse = await CreateUser({
        tenantId: user.tenantId,
        email: user.email || "",
        name: user.name || "",
        upn: user.upn,
        admin: user.admin,
        groups: userGroups,
        globalAdmin: user.globalAdmin,
        tenantAdmin: user.tenantAdmin,
      })
      if (createUserResponse.status !== STATUS_OK) throw createUserResponse
      return createUserResponse.response
    }
    if (existingUserResponse.status !== STATUS_OK) throw existingUserResponse
    return existingUserResponse.response
  } catch (error) {
    logger.error("Error getserting user", { error })
    throw error
  }
}

export async function getUser(tenantId: string, userUpn: string): Promise<UserRecord | null> {
  const userResponse = await GetUserByUpn(tenantId, userUpn)
  if (userResponse.status !== "OK") return null
  return userResponse.response
}
