import NextAuth, { NextAuthOptions, User } from "next-auth"
import { JWT } from "next-auth/jwt"
import { Provider } from "next-auth/providers"
import AzureADProvider from "next-auth/providers/azure-ad"

import { AGENCY_NAME } from "@/app-global"

import { GetTenantApplicationConfig, GetTenantDetailsById } from "@/features/services/tenant-service"

import { UserSignInHandler, SignInErrorType, getUser } from "./sign-in"

export type AuthToken = JWT &
  Omit<User, "groups"> & {
    exp: number
    iat: number
    refreshExpiresIn: number
  }

const configureIdentityProvider = (): Provider[] => {
  const providers: Provider[] = []

  if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID) {
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/azure-ad`
    providers.push(
      AzureADProvider({
        name: `${AGENCY_NAME} Single Sign On`,
        style: { logo: "", text: "#ffffff", bg: "#09549f" },
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        tenantId: process.env.AZURE_AD_TENANT_ID,
        wellKnown: process.env.AZURE_AD_OPENID_CONFIGURATION,
        authorization: {
          url: process.env.AZURE_AD_AUTHORIZATION_ENDPOINT,
          params: {
            client_id: process.env.AZURE_AD_CLIENT_ID,
            redirect_uri: redirectUri,
            response_type: "code",
          },
        },
        token: {
          url: process.env.AZURE_AD_TOKEN_ENDPOINT,
          params: {
            client_id: process.env.AZURE_AD_CLIENT_ID,
            client_secret: process.env.AZURE_AD_CLIENT_SECRET,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
          },
        },
        userinfo: process.env.AZURE_AD_USERINFO_ENDPOINT,
        profile: async profile => {
          const upnLower = profile.upn.toLowerCase()
          const email = profile.email?.toLowerCase() ?? upnLower
          const globalAdmin = !!profile.roles?.includes("GlobalAdmin")
          profile.tenantId = profile.employee_idp || profile.tid
          profile.groups = profile.groups || profile.employee_groups

          const [tenantAppResult, tenantResult, user] = await Promise.all([
            GetTenantApplicationConfig(profile.tenantId),
            GetTenantDetailsById(profile.tenantId),
            getUser(profile.tenantId, profile.upn),
          ])
          if (tenantAppResult.status !== "OK" || tenantResult.status !== "OK" || !user)
            throw new Error("Failed to retrieve tenant or user details")

          const isAppAdmin = tenantAppResult.response.accessGroups.some(accessGroup =>
            profile.groups.includes(accessGroup)
          )
          const normalisedUserIdentifier = (profile.upn || profile.email || "")?.toLowerCase()
          const isTenantAdmin = tenantResult.response.administrators
            .map(admin => admin.toLowerCase())
            .includes(normalisedUserIdentifier)

          return {
            ...profile,
            id: profile.sub,
            name: profile.name,
            email: email,
            upn: profile.upn,
            admin: isAppAdmin,
            globalAdmin: globalAdmin,
            tenantAdmin: isTenantAdmin,
            userId: profile.upn,
            acceptedTermsDate: (user?.accepted_terms && user?.accepted_terms_date) || null,
            lastVersionSeen: user?.last_version_seen || null,
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
    jwt({ token, user, trigger, session }) {
      const authToken = token as AuthToken
      if (user) {
        authToken.admin = user.admin
        authToken.globalAdmin = user.globalAdmin
        authToken.tenantAdmin = user.tenantAdmin
        authToken.tenantId = user.tenantId
        authToken.upn = user.upn
        authToken.userId = user.userId
        authToken.acceptedTermsDate = user.acceptedTermsDate
        authToken.lastVersionSeen = user.lastVersionSeen
      }
      if (trigger === "update" && session?.acceptedTerms) authToken.acceptedTermsDate = new Date().toISOString()
      if (trigger === "update" && session?.lastVersionSeen) authToken.lastVersionSeen = session.lastVersionSeen

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
      session.user.acceptedTermsDate = authToken.acceptedTermsDate
      session.user.lastVersionSeen = authToken.lastVersionSeen
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
    logo: "/ai-icon.webp",
    buttonText: `Single sign-on in with your ${AGENCY_NAME} Account`,
  },
  useSecureCookies: true,
  debug: process.env.NODE_ENV === "development",
}

export const handlers = NextAuth(options)
