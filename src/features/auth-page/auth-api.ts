import NextAuth, { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { Provider } from "next-auth/providers/index";
import { hashValue } from "./helpers";

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */

async function refreshAccessToken(token: any) {
  console.log("second executed");

  try {
    const url = `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        `grant_type=refresh_token` +
        `&client_secret=${process.env.AZURE_AD_CLIENT_SECRET}` +
        `&refresh_token=${token.refreshToken}` +
        `&client_id=${process.env.AZURE_AD_CLIENT_ID}`,
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.log(error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const configureIdentityProvider = () => {
  const providers: Array<Provider> = [];

  const adminEmails = process.env.ADMIN_EMAIL_ADDRESS?.split(",").map((email) =>
    email.toLowerCase().trim()
  );

  if (
    process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID
  ) {
    providers.push(
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        tenantId: process.env.AZURE_AD_TENANT_ID,
        authorization: {
          params: {
            scope:
              "openid profile email offline_access User.Read User.Read.All",
          },
        },
        async profile(profile) {
          const newProfile = {
            ...profile,
            // throws error without this - unsure of the root cause (https://stackoverflow.com/questions/76244244/profile-id-is-missing-in-google-oauth-profile-response-nextauth)
            id: profile.sub,
            isAdmin:
              adminEmails?.includes(profile.email.toLowerCase()) ||
              adminEmails?.includes(profile.preferred_username.toLowerCase()),
          };
          return newProfile;
        },
      })
    );
  }

  // If we're in local dev, add a basic credential provider option as well
  // (Useful when a dev doesn't have access to create app registration in their tenant)
  // This currently takes any username and makes a user with it, ignores password
  // Refer to: https://next-auth.js.org/configuration/providers/credentials
  if (process.env.NODE_ENV === "development") {
    providers.push(
      CredentialsProvider({
        name: "localdev",
        credentials: {
          username: { label: "Username", type: "text", placeholder: "dev" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials, req): Promise<any> {
          // You can put logic here to validate the credentials and return a user.
          // We're going to take any username and make a new user with it
          // Create the id as the hash of the email as per userHashedId (helpers.ts)
          const username = credentials?.username || "dev";
          const email = username + "@localhost";
          const user = {
            id: hashValue(email),
            name: username,
            email: email,
            isAdmin: false,
            image: "",
          };
          console.log(
            "=== DEV USER LOGGED IN:\n",
            JSON.stringify(user, null, 2)
          );
          return user;
        },
      })
    );
  }

  return providers;
};

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [...configureIdentityProvider()],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      console.log("first executed");
      if (user?.isAdmin) {
        token.isAdmin = user.isAdmin;
      }
      if (account && profile) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = (account.expires_at as number) * 1000;
        token.refreshToken = account.refresh_token;
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token, user }) {
      session.user.isAdmin = token.isAdmin as boolean;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

export const handlers = NextAuth(options);
