import { DefaultSession } from "next-auth";

// https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth" {
  interface Session {
    user: {
      isAdmin: boolean;
      accessToken: string;
    } & DefaultSession["user"];
  }

  interface Token {
    isAdmin: boolean;
    accessToken: string;
  }

  interface User {
    isAdmin: boolean;
    accessToken: string;
  }
}
