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
import { migrateChatMessagesForCurrentUser } from "@/features/chat/chat-services/chat-message-service"
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
        }
        const tenant = await CreateTenant(tenantRecord, user.upn)
        if (tenant.status !== STATUS_OK) throw tenant

        const isTenantAdmin = tenantRecord.administrators.includes(user.upn || user.email || "") ? true : false

        const userUpdate = {
          ...resetFailedLogin(userRecord),
          groups: userGroups,
          globalAdmin: user.globalAdmin,
          tenantAdmin: isTenantAdmin,
        }
        const updatedUser = await UpdateUser(user.tenantId, user.userId, userUpdate)
        if (updatedUser.status !== STATUS_OK) throw updatedUser
        await migrateChatMessagesForCurrentUser(updatedUser.response.id, user.tenantId)

        return user.globalAdmin ? { success: true } : { success: false, errorCode: SignInErrorType.NotAuthorised }
      }

      if (tenantResponse.status !== STATUS_OK) throw tenantResponse
      const tenant = tenantResponse.response

      const isTenantAdmin = tenant.administrators.includes(user.upn || user.email || "") ? true : false

      const userHasRequiredGroupAccess =
        !tenant.requiresGroupLogin || isUserInRequiredGroups(userGroups, tenant.groups || [])

      if (userHasRequiredGroupAccess) {
        const userUpdate = {
          ...resetFailedLogin(userRecord),
          groups: userGroups,
          globalAdmin: user.globalAdmin || false,
          tenantAdmin: isTenantAdmin,
        }

        const updatedUser = await UpdateUser(user.tenantId, user.userId, userUpdate)
        if (updatedUser.status !== STATUS_OK) throw updatedUser

        await migrateChatMessagesForCurrentUser(updatedUser.response.id, user.tenantId)
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
      // TODO handle error
      console.error("Error handling sign-in:", error)
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
        email: user.email ?? user.upn,
        name: user.name ?? "",
        upn: user.upn,
        userId: user.upn,
        admin: user.admin ?? false,
        last_login: now,
        first_login: now,
        accepted_terms: false,
        accepted_terms_date: "",
        groups: userGroups,
        failed_login_attempts: 0,
        last_failed_login: null,
        tenantAdmin: user.tenantAdmin ?? false,
        globalAdmin: user.globalAdmin ?? false,
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
    // TODO handle error
    console.error("Error upserting user:", error)
    throw error
  }
}
