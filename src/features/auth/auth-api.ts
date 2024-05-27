import NextAuth, { NextAuthOptions } from "next-auth"
import { JWT } from "next-auth/jwt"
import { Provider } from "next-auth/providers"
import AzureADProvider from "next-auth/providers/azure-ad"

import { UserSignInHandler, SignInErrorType } from "./sign-in"

export interface AuthToken extends JWT {
  admin: boolean
  globalAdmin: boolean
  tenantAdmin: boolean
  exp: number
  iat: number
  refreshExpiresIn: number
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
            scope: "openid profile email User.Read",
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
        profile: profile => {
          const upn = profile.upn.toLowerCase()
          const email = profile.email != undefined ? profile.email?.toLowerCase() : upn

          const admin = adminEmails.includes(email || upn) ? true : false
          const globalAdmin = profile.roles?.includes("GlobalAdmin") ? true : false

          profile.tenantId = profile.employee_idp || profile.tid
          profile.secGroups = profile.employee_groups || profile.groups
          return {
            ...profile,
            id: profile.sub,
            name: profile.name,
            email: email,
            upn: upn,
            admin: admin,
            globalAdmin: globalAdmin,
            tenantAdmin: globalAdmin,
            userId: upn,
          }
        },
      })
    )
  }
  return providers
}

//TODO - Figure out and assign tenant admin here?

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [...configureIdentityProvider()],
  callbacks: {
    async signIn({ user }) {
      if (!user?.tenantId || !user?.upn) {
        return false
      }

      try {
        const groups = user?.secGroups ?? []
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
        authToken.admin = user.admin ?? false
        authToken.globalAdmin = user.globalAdmin ?? false
        authToken.tenantAdmin = user.tenantAdmin ?? false
        authToken.tenantId = user.tenantId ?? ""
        authToken.upn = user.upn ?? ""
        authToken.userId = user.userId ?? ""
      }
      return authToken
    },
    session({ session, token }) {
      const authToken = token as AuthToken
      session.user.admin = authToken.admin ?? false
      session.user.globalAdmin = authToken.globalAdmin ?? false
      session.user.tenantAdmin = authToken.tenantAdmin ?? false
      session.user.tenantId = authToken.tenantId ? String(authToken.tenantId) : ""
      session.user.upn = authToken.upn ? String(authToken.upn) : ""
      session.user.userId = authToken.userId ? String(authToken.userId) : ""
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
