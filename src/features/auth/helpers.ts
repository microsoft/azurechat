import { createHash } from "crypto"

import { getServerSession } from "next-auth"

import { TenantRecord } from "@/features/tenant-management/models"
import { GetTenantById } from "@/features/tenant-management/tenant-service"
import { UserRecord } from "@/features/user-management/models"
import { GetUserByUpn } from "@/features/user-management/user-service"

import { options } from "./auth-api"

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
  return tenant.response.administrators.includes(userModel.upn)
}

export const getTenantId = async (): Promise<string> => {
  const user = await userSession()
  if (user) {
    return user.tenantId
  }
  throw new Error("Tenant not found")
}

export const getTenantAndUser = async (): Promise<[TenantRecord, UserRecord]> => {
  const userModel = await userSession()
  if (!userModel) throw new Error("User not found")
  const tenant = await GetTenantById(userModel.tenantId)
  if (tenant.status !== "OK") throw new Error("Tenant not found")
  const user = await GetUserByUpn(tenant.response.id, userModel.upn)
  if (user.status !== "OK") throw new Error("User not found")
  return [tenant.response, user.response]
}

export type UserModel = {
  name: string
  image: string
  email: string
  upn: string
  tenantId: string
  qchatAdmin: boolean
  userId: string
}

export const hashValue = (value: string): string => {
  const hash = createHash("sha256")
  hash.update(value)
  return hash.digest("hex")
}
