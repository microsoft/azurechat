import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

const LOGIN_PAGE = "/login"
const UNAUTHORISED_PAGE = "/unauthorised"

const requireAuth: string[] = [
  "/admin",
  "/api",
  "/chat",
  "/hallucinations",
  "/persona",
  "/prompt",
  "/prompt-guide",
  "/reporting",
  "/settings",
  "/tenant",
  "/terms",
  "/whats-new",
]

const requireAdmin: string[] = ["/admin", "/reporting", "/settings", "/tenant"]

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname

  if (requireAuth.some(path => pathname.startsWith(path))) {
    const token = await getToken({ req: request })

    if (!token) {
      return NextResponse.redirect(new URL(LOGIN_PAGE, request.url))
    }

    const now = Math.floor(Date.now() / 1000)
    if (token.exp && typeof token.exp === "number" && token.exp < now) {
      return NextResponse.redirect(new URL(LOGIN_PAGE, request.url))
    }

    if (requireAdmin.some(path => pathname.startsWith(path)) && !token.qchatAdmin) {
      return NextResponse.rewrite(new URL(UNAUTHORISED_PAGE, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/chat/:path*",
    "/api/cosmos/:path*",
    "/api/images/:path*",
    "/chat/:path*",
    "/hallucinations/:path*",
    "/persona/:path*",
    "/prompt-guide/:path*",
    "/prompt/:path*",
    "/reporting/:path*",
    "/settings/:path*",
    "/tenant/:path*",
    "/terms/:path*",
    "/unauthorised/:path*",
    "/whats-new/:path*",
  ],
}
