import { User } from "next-auth"
import { AdapterUser } from "next-auth/adapters"

import {
  STATUS_UNAUTHORIZED,
  STATUS_ERROR,
  STATUS_NOT_FOUND,
  STATUS_OK,
  SUPPORT_EMAIL_PREFIX,
  CONTEXT_PROMPT_DEFAULT,
} from "@/app-global"

import { hashValue } from "@/features/auth/helpers"
import logger from "@/features/insights/app-insights"
import { type TenantRecord } from "@/features/tenant-management/models"
import { CreateTenant, GetTenantById } from "@/features/tenant-management/tenant-service"
import { UserRecord } from "@/features/user-management/models"
import { CreateUser, GetUserByUpn, UpdateUser } from "@/features/user-management/user-service"

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
      const onBoardDate = user.globalAdmin ? null : new Date().toISOString()

      if (tenantResponse.status === STATUS_ERROR || tenantResponse.status === STATUS_UNAUTHORIZED) {
        return {
          success: false,
          errorCode: SignInErrorType.NotAuthorised,
        }
      }

      if (tenantResponse.status === STATUS_NOT_FOUND) {
        const now = new Date()
        const domain = user.upn?.split("@")[1] || ""
        const historyMessage = user.globalAdmin
          ? `${now.toISOString()}: Tenant created by global admin user ${user.upn}.`
          : `${now.toISOString()}: Tenant created by user ${user.upn} on failed login.`

        const tenantRecord: TenantRecord = {
          tenantId: user.tenantId,
          primaryDomain: domain,
          requiresGroupLogin: true,
          id: user.tenantId,
          email: user.upn,
          supportEmail: SUPPORT_EMAIL_PREFIX + domain,
          dateCreated: now.toISOString(),
          dateUpdated: now.toISOString(),
          dateOnBoarded: onBoardDate,
          dateOffBoarded: null,
          modifiedBy: user.upn,
          createdBy: user.upn,
          departmentName: null,
          groups: [],
          administrators: admins,
          features: [],
          serviceTier: null,
          history: [`${historyMessage}`],
          preferences: { contextPrompt: CONTEXT_PROMPT_DEFAULT },
          smartTools: [],
        }
        const tenant = await CreateTenant(tenantRecord, user.upn)
        if (tenant.status !== STATUS_OK) throw tenant

        const userUpdate = {
          ...resetFailedLogin(userRecord),
          groups: userGroups,
          globalAdmin: user.globalAdmin,
          tenantAdmin: user.tenantAdmin,
        }
        const updatedUser = await UpdateUser(user.tenantId, user.userId, userUpdate)
        if (updatedUser.status !== STATUS_OK) throw updatedUser

        return user.globalAdmin ? { success: true } : { success: false, errorCode: SignInErrorType.NotAuthorised }
      }

      if (tenantResponse.status !== STATUS_OK) throw tenantResponse
      const tenant = tenantResponse.response

      const userHasRequiredGroupAccess =
        !tenant.requiresGroupLogin || isUserInRequiredGroups(userGroups, tenant.groups || [])

      if (userHasRequiredGroupAccess) {
        const userUpdate = {
          ...resetFailedLogin(userRecord),
          groups: userGroups,
          globalAdmin: user.globalAdmin,
          tenantAdmin: user.tenantAdmin,
        }

        const updatedUser = await UpdateUser(user.tenantId, user.userId, userUpdate)
        if (updatedUser.status !== STATUS_OK) throw updatedUser

        return { success: true }
      }

      const userUpdate = {
        ...updateFailedLogin(userRecord),
        groups: userGroups,
      }
      const updatedUser = await UpdateUser(user.tenantId, user.userId, userUpdate)
      if (updatedUser.status !== STATUS_OK) throw updatedUser

      return { success: false, errorCode: SignInErrorType.NotAuthorised }
    } catch (error) {
      logger.error("Error signing in user", { error })
      return { success: false, errorCode: SignInErrorType.SignInFailed }
    }
  }
}

const updateFailedLogin = (existingUser: UserRecord): UserRecord => ({
  ...existingUser,
  failed_login_attempts: existingUser.failed_login_attempts + 1,
  last_failed_login: new Date(),
})

const resetFailedLogin = (existingUser: UserRecord): UserRecord => ({
  ...existingUser,
  failed_login_attempts: 0,
})

const isUserInRequiredGroups = (userGroups: string[], requiredGroups: string[]): boolean =>
  !!requiredGroups.length && requiredGroups.some(groupId => userGroups.includes(groupId))

const getsertUser = async (userGroups: string[], user: User | AdapterUser): Promise<UserRecord> => {
  try {
    const now = new Date()
    const existingUserResponse = await GetUserByUpn(user.tenantId, user.upn ?? "")

    if (existingUserResponse.status === STATUS_NOT_FOUND) {
      const createUserResponse = await CreateUser({
        id: hashValue(user.upn),
        tenantId: user.tenantId,
        email: user.email,
        name: user.name,
        upn: user.upn,
        userId: user.upn,
        admin: user.admin,
        last_login: now,
        first_login: now,
        accepted_terms: false,
        accepted_terms_date: "",
        groups: userGroups,
        failed_login_attempts: 0,
        last_failed_login: null,
        tenantAdmin: user.tenantAdmin,
        globalAdmin: user.globalAdmin,
        history: [`${now}: User created.`],
        preferences: {
          contextPrompt: CONTEXT_PROMPT_DEFAULT,
          history: [],
        },
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

export async function isTenantAdmin(user: User | AdapterUser): Promise<boolean> {
  try {
    const tenantResponse = await GetTenantById(user.tenantId)
    if (tenantResponse.status !== STATUS_OK) {
      return false
    }

    const tenant = tenantResponse.response
    const normalisedUserIdentifier = (user.upn || user.email || "")?.toLowerCase()
    const isTenantAdmin = tenant.administrators.map(admin => admin.toLowerCase()).includes(normalisedUserIdentifier)
    return isTenantAdmin
  } catch (_error) {
    return false
  }
}

export async function getUser(tenantId: string, userUpn: string): Promise<UserRecord> {
  try {
    const userResponse = await GetUserByUpn(tenantId, userUpn)
    if (userResponse.status !== "OK") throw userResponse.errors
    return userResponse.response
  } catch (error) {
    logger.error(`Error getting user - TenantId: ${tenantId} UPN: ${userUpn} `, { error })
    throw error
  }
}
