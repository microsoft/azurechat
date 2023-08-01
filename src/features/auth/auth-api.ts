import NextAuth, { NextAuthOptions } from "next-auth";
import { Provider } from "next-auth/providers";
import AzureADProvider from "next-auth/providers/azure-ad";
import GitHubProvider from "next-auth/providers/github";

const configureIdentityProvider = () => {
  const providers: Array<Provider> = [];

  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(
      GitHubProvider({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!,
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
      })
    );
  }
  return providers;
};

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [...configureIdentityProvider()],
  session: {
    strategy: "jwt",
  },
};

export const handlers = NextAuth(options);
