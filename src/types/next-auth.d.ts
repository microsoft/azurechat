import NextAuth, { DefaultSession } from "next-auth"

// https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth" {

    interface Session {
        user: {
            qchatAdmin: boolean;
            tenantId: string;
            upn: string;
            userId: string;
        } & DefaultSession["user"]
    }
    interface User {
        qchatAdmin: boolean;
        tenantId: string;
        upn: string;
        userId: string;
    }
}
