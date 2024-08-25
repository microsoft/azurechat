import { createHash } from "crypto"

import { getServerSession } from "next-auth"

import { TenantEntity, UserEntity } from "@/features/database/entities"
import { GetTenantById } from "@/features/services/tenant-service"
import { GetUserByUpnOld } from "@/features/services/user-service"

import { options } from "./auth-api"
import { UserModel } from "./models"

export const userSession = async (): Promise<UserModel | null> => {
  const session = await getServerSession(options)
  if (session && session.user) {
    return session.user as UserModel
  }
  return null
}

export const userHashedId = async (): Promise<string> => {
  const user = await userSession()
  if (user) {
    return hashValue(user.upn)
  }
  throw new Error("User not found")
}

export const isTenantAdmin = async (): Promise<boolean> => {
  const userModel = await userSession()
  if (!userModel) throw new Error("User not found")
  const tenant = await GetTenantById(userModel.tenantId)
  if (tenant.status !== "OK") throw new Error("Tenant not found")
  const userIdentifier = (userModel.upn || userModel.email).toLowerCase()
  return tenant.response.administrators.map(admin => admin.toLowerCase()).includes(userIdentifier)
}

export const getTenantId = async (): Promise<string> => {
  const user = await userSession()
  if (user) return user.tenantId
  throw new Error("Tenant not found")
}

/** @deprecated */
export const getTenantAndUser = async (): Promise<[TenantEntity, UserEntity]> => {
  const userModel = await userSession()
  if (!userModel) throw new Error("User not found")
  const tenant = await GetTenantById(userModel.tenantId)
  if (tenant.status !== "OK") throw new Error("Tenant not found")
  const user = await GetUserByUpnOld(tenant.response.id, userModel.upn)
  if (user.status !== "OK") throw new Error("User not found")
  return [tenant.response, user.response]
}

export const hashValue = (value: string): string => {
  const hash = createHash("sha256")
  hash.update(value)
  return hash.digest("hex")
}

export const isAdmin = async (): Promise<boolean> => {
  const userModel = await userSession()
  return !!userModel?.admin
}

export const isAdminOrTenantAdmin = async (): Promise<boolean> => {
  const userModel = await userSession()
  if (!userModel) return false
  if (userModel.admin) return true
  const tenant = await GetTenantById(userModel.tenantId)
  if (tenant.status !== "OK") return false
  const userIdentifier = (userModel.upn || userModel.email).toLowerCase()
  return tenant.response.administrators.map(admin => admin.toLowerCase()).includes(userIdentifier)
}
