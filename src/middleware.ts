import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { AuthToken } from "./features/auth/auth-api";

const requireAuth: string[] = [
  "/chat",
  "/api",
  "/reporting",
  "/settings",
  "/tenant",
  "/admin",
  "/prompt-guide",
  "/what's-new",
];
const requireAdmin: string[] = ["/reporting", "/admin"];

export async function middleware(request: NextRequest) {
    const res = NextResponse.next();
    const pathname = request.nextUrl.pathname;

    if (requireAuth.some((path) => pathname.startsWith(path))) {
        const token = await getToken({ req: request }) as AuthToken | null;
        
        if (!token) {
            const url = new URL(`/login`, request.url);
            return NextResponse.redirect(url);
        }

        if (requireAdmin.some((path) => pathname.startsWith(path))) {
            if (!token.qchatAdmin || !await additionalAdminCheck(token)) {
                const url = new URL(`/unauthorised`, request.url);
                return NextResponse.rewrite(url);
            }
        }
    }

    return res;
}

async function additionalAdminCheck(token: AuthToken): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const maxAgeSeconds = 8 * 60 * 60;
    const tokenIsExpired = token.exp <= now;
    const tokenIsTooOld = (now - token.iat) > maxAgeSeconds;
    return !tokenIsExpired && !tokenIsTooOld;
}

export const config = {
  matcher: [
    "/chat/:path*",
    "/reporting/:path*",
    "/api/chat/:path*",
    "/settings/:path*",
    "/tenant/:path*",
    "/admin/:path*",
    "/prompt-guide/:path*",
    "/what's-new/:path*",
  ],
};
