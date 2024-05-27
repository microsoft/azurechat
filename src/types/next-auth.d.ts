import { DefaultSession } from "next-auth"

// https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth" {
  interface Session {
    user: {
      admin: boolean
      tenantAdmin: boolean
      globalAdmin: boolean
      tenantId: string
      upn: string
      userId: string
    } & DefaultSession["user"]
  }
  interface Token {
    admin: boolean
  }
  interface User {
    admin: boolean
    tenantAdmin: boolean
    globalAdmin: boolean
    tenantId: string
    upn: string
    userId: string
    secGroups: string[]
  }
}
