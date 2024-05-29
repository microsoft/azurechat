import NextAuth, { NextAuthOptions } from "next-auth"
import { JWT } from "next-auth/jwt"
import { Provider } from "next-auth/providers"
import AzureADProvider from "next-auth/providers/azure-ad"

import { UserSignInHandler, SignInErrorType, isTenantAdmin } from "./sign-in"

export interface AuthToken extends JWT {
  admin: boolean
  globalAdmin: boolean
  tenantAdmin: boolean
  exp: number
  iat: number
  refreshExpiresIn: number
  tenantId: string
  userId: string
  upn: string
}

const configureIdentityProvider = (): Provider[] => {
  const providers: Provider[] = []
  const adminEmails = process.env.ADMIN_EMAIL_ADDRESS?.split(",").map(email => email.toLowerCase().trim()) || []

  if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID) {
    providers.push(
      AzureADProvider({
        name: "Queensland Government Single Sign On",
        style: { logo: "", text: "#ffffff", bg: "#09549f" },
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        tenantId: process.env.AZURE_AD_TENANT_ID,
        wellKnown: process.env.AZURE_AD_OPENID_CONFIGURATION,
        authorization: {
          url: process.env.AZURE_AD_AUTHORIZATION_ENDPOINT,
          params: {
            client_id: process.env.AZURE_AD_CLIENT_ID,
            redirect_uri: process.env.NEXTAUTH_URL + "/api/auth/callback/azure-ad",
            response_type: "code",
          },
        },
        token: {
          url: process.env.AZURE_AD_TOKEN_ENDPOINT,
          params: {
            client_id: process.env.AZURE_AD_CLIENT_ID,
            client_secret: process.env.AZURE_AD_CLIENT_SECRET,
            grant_type: "authorization_code",
            redirect_uri: process.env.NEXTAUTH_URL + "/api/auth/callback/azure-ad",
          },
        },
        userinfo: process.env.AZURE_AD_USERINFO_ENDPOINT,
        profile: async profile => {
          const upnLower = profile.upn.toLowerCase()
          const email = profile.email?.toLowerCase() ?? upnLower
          const admin = adminEmails.includes(email || upnLower)
          const globalAdmin = profile.roles?.includes("GlobalAdmin") ? true : false
          profile.tenantId = profile.employee_idp || profile.tid
          profile.groups = profile.groups || profile.employee_groups

          const tenantAdmin = await isTenantAdmin(profile)
          return {
            ...profile,
            id: profile.sub,
            name: profile.name,
            email: email,
            upn: profile.upn,
            admin: admin,
            globalAdmin: globalAdmin,
            tenantAdmin: tenantAdmin,
            userId: profile.upn,
          }
        },
      })
    )
  }
  return providers
}

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [...configureIdentityProvider()],
  callbacks: {
    async signIn({ user }) {
      if (!user?.tenantId || !user?.upn) {
        return false
      }

      try {
        const groups = user?.groups ?? []
        const signInCallbackResponse = await UserSignInHandler.handleSignIn(user, groups)
        if (signInCallbackResponse.success) {
          return true
        }
        switch (signInCallbackResponse.errorCode) {
          case SignInErrorType.NotAuthorised:
            return `/login-error?error=${encodeURIComponent(SignInErrorType.NotAuthorised)}`
          case SignInErrorType.SignInFailed:
            return `/login-error?error=${encodeURIComponent(SignInErrorType.SignInFailed)}`
          default:
            return false
        }
      } catch (_error) {
        return false
      }
    },
    jwt({ token, user }) {
      const authToken = token as AuthToken
      if (user) {
        authToken.admin = user.admin
        authToken.globalAdmin = user.globalAdmin
        authToken.tenantAdmin = user.tenantAdmin
        authToken.tenantId = user.tenantId
        authToken.upn = user.upn
        authToken.userId = user.userId
      }
      return authToken
    },
    session({ session, token }) {
      const authToken = token as AuthToken
      session.user.admin = authToken.admin
      session.user.globalAdmin = authToken.globalAdmin
      session.user.tenantAdmin = authToken.tenantAdmin
      session.user.tenantId = authToken.tenantId
      session.user.upn = authToken.upn
      session.user.userId = authToken.userId
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    error: "/login-error",
  },
  theme: {
    colorScheme: "dark",
    brandColor: "#09549f",
    logo: "/ai-icon.png",
    buttonText: "Single sign-on in with your Queensland Government Account",
  },
  useSecureCookies: true,
  debug: process.env.NODE_ENV === "development",
}

export const handlers = NextAuth(options)
