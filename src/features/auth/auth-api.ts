import NextAuth, { NextAuthOptions, Profile, User } from "next-auth";
import { Provider } from "next-auth/providers";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { hashValue } from "./helpers";
import { JWT } from "next-auth/jwt";
import { UserSignInHandler } from "./sign-in";
import { UserActivity, UserIdentity, UserRecord } from "../user-management/user-cosmos";

interface Credentials {
  username?: string;
}

export interface AuthToken extends JWT {
  qchatAdmin?: boolean;
  exp: number;
  iat: number;
  refreshExpiresIn: number;
}

interface ExtendedProfile extends Profile {
  employee_groups?: string[];
}

const validateEnv = () => {
  const requiredEnvVars = [
    'NEXTAUTH_SECRET',
    'AZURE_AD_CLIENT_ID',
    'AZURE_AD_CLIENT_SECRET',
    'AZURE_AD_TENANT_ID',
    'AZURE_AD_OPENID_CONFIGURATION',
    'AZURE_AD_AUTHORIZATION_ENDPOINT',
    'AZURE_AD_TOKEN_ENDPOINT',
    'AZURE_AD_USERINFO_ENDPOINT',
    'AZURE_AD_REDIRECT_URL',
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingEnvVars.length) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
};

//validateEnv();

const configureIdentityProvider = (): Provider[] => {
  const providers: Provider[] = [];
  const adminEmails = process.env.ADMIN_EMAIL_ADDRESS?.split(",").map(email => email.toLowerCase().trim()) || [];

  if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID) {
    providers.push(
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        tenantId: process.env.AZURE_AD_TENANT_ID,
        wellKnown: process.env.AZURE_AD_OPENID_CONFIGURATION,
        authorization: {
          url: process.env.AZURE_AD_AUTHORIZATION_ENDPOINT,
          params: {
            client_id: process.env.AZURE_AD_CLIENT_ID,
            redirect_uri: process.env.AZURE_AD_REDIRECT_URL,
            response_type: "code",
          }
        },
        token: {
          url: process.env.AZURE_AD_TOKEN_ENDPOINT,
          params: {
            client_id: process.env.AZURE_AD_CLIENT_ID,
            client_secret: process.env.AZURE_AD_CLIENT_SECRET,
            grant_type: "authorization_code",
            redirect_uri: process.env.AZURE_AD_REDIRECT_URL,
          }
        },
        userinfo: process.env.AZURE_AD_USERINFO_ENDPOINT,
        profile: (profile) => {
          const email = profile.email?.toLowerCase();
          const qchatAdmin = adminEmails.includes(email);
          return {
            ...profile,
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            upn: profile.upn,
            tenantId: profile.employee_idp,
            qchatAdmin: qchatAdmin,
            userId: profile.upn,
          };
        }
      }),
    );
  }

  if (process.env.NODE_ENV === "development") {
    providers.push(
      CredentialsProvider({
        name: "QChatDevelopers",
        credentials: {
          username: { label: "Username", type: "text", placeholder: "Enter your username" },
        },        
        async authorize(credentials: Record<string, any> | undefined, req): Promise<User> {
          const typedCredentials = credentials as Credentials;
        
          const username = typedCredentials.username || "dev";
          const email = `${username}@localhost`;
          const qchatAdmin = adminEmails.includes(email.toLowerCase());

          const userIdentity: User = {
            id: hashValue(username),
            name: username,
            email: email,
            upn: username,
            tenantId: "localdev",
            qchatAdmin: qchatAdmin,
            userId: username,
          };
          return userIdentity
        }
      })
    );
  }
  return providers;
};

async function refreshAccessToken(token: AuthToken): Promise<AuthToken> {
  try {
    const tokenUrl = process.env.AZURE_AD_TOKEN_ENDPOINT!;
    const formData = new URLSearchParams({
      client_id: process.env.AZURE_AD_CLIENT_ID!,
      client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken as string,
    });

    const response = await fetch(tokenUrl, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh access token. Status: ${response.status}`);
    }

    const refreshedTokens = await response.json();

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token,
      expiresIn: Date.now() + refreshedTokens.expires_in * 1000,
      refreshExpiresIn: Date.now() + refreshedTokens.refresh_expires_in * 1000,
    };
  } catch (error) {
    console.log("RefreshAccessTokenError", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
};

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [...configureIdentityProvider()],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user?.tenantId && user?.upn) {
        const now = new Date()
        const ExtendedProfile = profile as ExtendedProfile;
        const userIdentity: UserIdentity = {
          id: hashValue(user.upn),
          tenantId: user.tenantId,
          email: user.email ?? '',
          name: user.name ?? '',
          upn: user.upn,
          userId: user.upn,
          qchatAdmin: user.qchatAdmin,
        };
        const userActivity: UserActivity = {
          last_login: now,
          first_login: now,
          accepted_terms: true,
          accepted_terms_date: now.toISOString(),
          failed_login_attempts: 0,
          last_failed_login: null,
        };
        const userRecord: UserRecord = { ...userIdentity, ...userActivity };
        try {
          const groupsArray = ExtendedProfile?.employee_groups as string[] | undefined;
          const groupsString = groupsArray?.join(',');
          await UserSignInHandler.handleSignIn(userRecord, groupsString);
          return true;
        } catch (error) {
          console.log("Error in signIn callback:", error);
          return false;
        }
      } else {
        console.log("TenantId or upn is missing. Sign-in aborted.", user.tenantId, user.upn);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      let authToken = token as AuthToken;
      if (user) {
        authToken.qchatAdmin = user.qchatAdmin ?? false;
        authToken.tenantId = user.tenantId ?? '';
        authToken.upn = user.upn ?? '';

      }
      if (account && account.access_token && account.refresh_token) {
        const expiresIn = Number(account.expires_in ?? 0);
        const refreshExpiresIn = Number(account.refresh_expires_in ?? 0);

        authToken.accessToken = account.access_token;
        authToken.refreshToken = account.refresh_token;
        authToken.expiresIn = Date.now() + expiresIn * 1000;
        authToken.refreshExpiresIn = Date.now() + refreshExpiresIn * 1000;
      }

      if (authToken.refreshToken && typeof authToken.expiresIn === 'number' && Date.now() > authToken.expiresIn) {
        authToken = await refreshAccessToken(authToken);
      }

      return authToken;
    },
    async session({ session, token }) {
      const authToken = token as AuthToken;
      session.user.qchatAdmin = authToken.qchatAdmin ?? false;
      session.user.tenantId = authToken.tenantId ? String(authToken.tenantId) : '';
      session.user.upn = authToken.upn ? String(authToken.upn) : '';
      return session;
    }
    
    
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
};

export const handlers = NextAuth(options);