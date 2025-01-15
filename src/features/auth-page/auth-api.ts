import NextAuth, { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { Provider } from "next-auth/providers/index";
import { hashValue } from "./helpers";

const configureIdentityProvider = () => {
  const providers: Array<Provider> = [];

  const adminEmails = process.env.ADMIN_EMAIL_ADDRESS?.split(",").map((email) =>
    email.toLowerCase().trim()
  );

  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(
      GitHubProvider({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!,
        async profile(profile, tokens) {
          const newProfile = {
            ...profile,
            isAdmin: adminEmails?.includes(profile.email.toLowerCase()),
            image: profile.avatar_url, // GitHub profile picture
          };

          if (tokens?.access_token) {
            newProfile.accessToken = tokens.access_token;
          }

          return newProfile;
        },
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
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        tenantId: process.env.AZURE_AD_TENANT_ID,
        authorization: { params: { scope: "openid profile User.Read email" } },
        async profile(profile, tokens) {
          const profilePictureUrl = `https://graph.microsoft.com/v1.0/me/photos/48x48/$value`;
          const profilePicture = await fetch(profilePictureUrl, {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          });

          const baseProfile = {
            ...profile,
            id: profile.sub,
            email: profile.email,
            accessToken: tokens.access_token,
            isAdmin:
              adminEmails?.includes(profile.email.toLowerCase()) ||
              adminEmails?.includes(profile.preferred_username.toLowerCase()),
          };

          if (profilePicture.ok) {
            const pictureBuffer = await profilePicture.arrayBuffer();
            const pictureBase64 = Buffer.from(pictureBuffer).toString("base64");
            return {
              ...baseProfile,
              image: `data:image/jpeg;base64, ${pictureBase64}`,
            };
          } else {
            return baseProfile;
          }
        },
      })
    );
  }

  if (process.env.NODE_ENV === "development") {
    providers.push(
      CredentialsProvider({
        name: "localdev",
        credentials: {
          username: { label: "Username", type: "text", placeholder: "dev" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials, req): Promise<any> {
          const username = credentials?.username || "dev";
          const email = `${username}@localhost`;
          const user = {
            id: hashValue(email),
            name: username,
            email: email,
            isAdmin: false,
            accessToken: "fake_token",
            image: "", // Set an image if available for local dev
          };
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
    async jwt({ token, user, account }) {
      if (user?.isAdmin) {
        token.isAdmin = user.isAdmin;
      }

      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.isAdmin = token.isAdmin as boolean;
      session.user.accessToken = token.accessToken as string;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

export const handlers = NextAuth(options);
