import { createHash } from "crypto"
import { getServerSession } from "next-auth"
// import { RedirectToPage } from "../common/navigation-helpers"
import { options } from "./auth-api"

export const userSession = async (): Promise<UserModel | null> => {
  const session = await getServerSession(options)
  if (session && session.user) {
    return session.user as UserModel
  }
  return null
}

export const getCurrentUser = async (): Promise<UserModel> => {
  const user = await userSession()
  if (user) {
    return user
  }
  throw new Error("User not found")
}

export const userHashedId = async (): Promise<string> => {
  const user = await userSession()
  if (user) {
    return hashValue(user.upn)
  }
  throw new Error("User not found")
}

export const getTenantId = async (): Promise<string> => {
  const user = await userSession()
  if (user) {
    return user.tenantId
  }
  throw new Error("Tenant not found")
}

export const getContextPrompt = async (): Promise<string> => {
  const user = await userSession()
  if (user) {
    return user.contextPrompt || ""
  }
  throw new Error("Context Prompt not found")
}

// export const redirectIfAuthenticated = async (): Promise<void> => {
//   const user = await userSession()
//   if (user) {
//     RedirectToPage("chat")
//   }
// }

export type UserModel = {
  name: string
  image: string
  email: string
  upn: string
  tenantId: string
  qchatAdmin: boolean
  userId: string
  contextPrompt?: string
}

export const hashValue = (value: string): string => {
  const hash = createHash("sha256")
  hash.update(value)
  return hash.digest("hex")
}
