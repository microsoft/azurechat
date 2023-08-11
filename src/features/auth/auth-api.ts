import NextAuth, {NextAuthOptions} from "next-auth";
import GoogleProvider, {GoogleProfile} from "next-auth/providers/google"

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        // TODO: Googleは初回のみトークンが発行されるため、永続化処理が必要。ref.) https://next-auth.js.org/providers/google　一次対応として毎回リフレッシュさせるオプションを入れる
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      }
    )
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({account, profile}) {
      if (account?.provider === "google") {
        return (profile as GoogleProfile).email_verified && profile.email?.endsWith(process.env.PERMIT_GOOGLE_ORGANIZATION_DOMAIN)
      }
      return true
    },
  }
};

export const handlers = NextAuth(options);
