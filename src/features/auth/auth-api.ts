import NextAuth, { NextAuthOptions } from "next-auth";
import { Provider } from "next-auth/providers";
import AzureADProvider from "next-auth/providers/azure-ad";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { hashValue } from "./helpers";

const configureIdentityProvider = () => {
  const providers: Array<Provider> = [];

  const adminEmails = process.env.ADMIN_EMAIL_ADDRESS?.split(",").map(email => email.toLowerCase().trim()).filter(email => email);
  const azureAdAllowedPrincipals = process.env.AZURE_AD_ALLOWED_PRINCIPALS?.split(",").map(oid => oid.toLowerCase().trim()).filter(oid => oid);

  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(
      GitHubProvider({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!,
        async profile(profile) {
          const newProfile = {
            ...profile,
            isAdmin: adminEmails?.includes(profile.email.toLowerCase()),
            isAllowed: true
          }
          return newProfile;
        }
      })
    );
  }

  if (
    process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID
  ) {
    providers.push(
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        tenantId: process.env.AZURE_AD_TENANT_ID!,
        authorization: {
          params: {
            // Add User.Read to reach the /me endpoint of Microsoft Graph
            scope: 'email openid profile User.Read'
          }
        },
        async profile(profile, tokens) {
          let isAllowed = true
          if (Array.isArray(azureAdAllowedPrincipals) && azureAdAllowedPrincipals.length > 0) {
            try {
              isAllowed = false
              // POST https://graph.microsoft.com/v1.0/me/getMemberObjects
              // It returns all IDs of principal objects which "me" is a member of (transitive)
              // https://learn.microsoft.com/en-us/graph/api/directoryobject-getmemberobjects?view=graph-rest-1.0&tabs=http
              const response = await fetch(
                'https://graph.microsoft.com/v1.0/me/getMemberObjects',
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                    'Content-Type': 'application/json'
                  },
                  body: '{"securityEnabledOnly":true}'
                }
              )
              if (response.ok) {
                const body = await response.json() as { value?: string[] }
                const oids = body.value ?? []
                if (profile.oid) {
                  // Append the object ID of user principal "me"
                  oids.push(profile.oid)
                }
                for (const principal of azureAdAllowedPrincipals) {
                  if (oids.includes(principal)) {
                    isAllowed = true
                    break
                  }
                }
              }
              else {
                const body = await response.text()
                throw new Error(`Bad response from POST /me/getMemberObjects: ${response.status} ${response.statusText}: ${body}`)
              }
            }
            catch (e) {
              console.log(e)
            }
          }
          const newProfile = {
            ...profile,
            // throws error without this - unsure of the root cause (https://stackoverflow.com/questions/76244244/profile-id-is-missing-in-google-oauth-profile-response-nextauth)
            id: profile.sub,
            isAdmin: adminEmails?.includes(profile.email.toLowerCase()) || adminEmails?.includes(profile.preferred_username.toLowerCase()),
            isAllowed
          }
          return newProfile;
        }
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
          console.log("=== DEV USER LOGGED IN:\n", JSON.stringify(user, null, 2));
          return user;
        }
      })
    );
  }

  return providers;
};

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [...configureIdentityProvider()],
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser, session }) {
      if (user?.isAdmin) {
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token, user }) {
      session.user.isAdmin = token.isAdmin as string
      return session
    },
    async signIn({ user }) {
      return user.isAllowed
    }
  },
  session: {
    strategy: "jwt",
  },
};

export const handlers = NextAuth(options);
