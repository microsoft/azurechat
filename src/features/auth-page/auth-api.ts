// Import NextAuth, but do not use it
import NextAuth from "next-auth";
import Providers from "next-auth/providers";

// Define a minimal configuration for NextAuth
const options = {
  providers: [
    // No providers are configured, so NextAuth will not handle any authentication
  ],
  callbacks: {
    // All callbacks are removed
  },
  session: {
    // Session strategy is removed
  },
};

// Export a minimal handler that does nothing
export const handlers = NextAuth(options);
