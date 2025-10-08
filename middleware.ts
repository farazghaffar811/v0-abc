import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = request.cookies.has("auth")
  const isAdmin = request.cookies.get("isAdmin")?.value === "true"

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register"]

  // Admin-only routes
  const adminRoutes = ["/dashboard"]

  // Market routes pattern
  const isMarketRoute = pathname.startsWith("/market/")

  // If trying to access market route, ensure authentication
  if (isMarketRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to login if not authenticated and trying to access a protected route
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If the user is authenticated but not an admin and trying to access admin routes
  if (isAuthenticated && !isAdmin && adminRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // For all other cases, continue with the request
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
