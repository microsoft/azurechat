import { DefaultSession } from "next-auth";

// https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth" {
  interface Session {
    user: {
      isAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface Token {
    isAdmin: boolean;
  }

  interface User {
    isAdmin: boolean;
  }
}
