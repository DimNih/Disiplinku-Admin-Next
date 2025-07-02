import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the request is for the login or register page
  const isAuthPage = pathname === "/login" || pathname === "/register"

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If the user is authenticated and trying to access login/register, redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If the user is not authenticated and trying to access protected routes, redirect to login
  if (!token && !isAuthPage && pathname !== "/_next" && !pathname.includes(".")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Add security headers to all responses
  const response = NextResponse.next()

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*; connect-src 'self' https://*;",
  )

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY")

  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff")

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Permissions Policy
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()")

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
