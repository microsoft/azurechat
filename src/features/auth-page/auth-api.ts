import NextAuth, { NextAuthOptions } from "next-auth";

const configureIdentityProvider = () => {
  const providers = []; // No providers needed for unauthenticated access
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
