import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const requireAuth: string[] = ["/chat", "/api","/reporting", "/unauthorized"];
const requireAdmin: string[] = ["/reporting"];


export async function middleware(request: NextRequest) {

    const res = NextResponse.next();
    const pathname = request.nextUrl.pathname;

    if (requireAuth.some((path) => pathname.startsWith(path))) {

        const token = await getToken({
            req: request
        });

        //check not logged in
        if (!token) {
            const url = new URL(`/`, request.url);
            return NextResponse.redirect(url);
        }

        if (requireAdmin.some((path) => pathname.startsWith(path))) {
            //check if not authorized
            if (!token.isAdmin) {
                const url = new URL(`/unauthorized`, request.url);
                return NextResponse.rewrite(url);
            }
        }
    }

    return res;
}

// note that middleware is not applied to api/auth as this is required to logon (i.e. requires anon access)
export const config = { matcher: ["/chat/:path*", "/reporting/:path*", "/api/chat:path*"] };
