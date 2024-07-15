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

  providers.push(
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "dev" },
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials, req): Promise<any> {
        // You can put logic here to validate the credentials and return a user.
        // We're going to take any username and make a new user with it
        // Create the id as the hash of the email as per userHashedId (helpers.ts)
        const username = credentials?.username || "dev";
        const email = credentials?.email || username + "@localhost";
        const user = {
          id: hashValue(email),
          name: username,
          email: email,
          isAdmin: false,
          image: "",
        };

        return user;
      },
    })
  );

  return providers;
};

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [...configureIdentityProvider()],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.isAdmin) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token, user }) {
      session.user.isAdmin = token.isAdmin as boolean;
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      if (user) {
        return true;
      } else {
        return '/auth/signin?error=CredentialsSignin'; // Redirect to custom login page with error query
      }
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url + "/chat" : baseUrl + "/chat";
    },
  },
  session: {
    strategy: "jwt",
  },
};

export const handlers = NextAuth(options);
