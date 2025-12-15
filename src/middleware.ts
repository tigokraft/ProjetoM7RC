import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/account/login",
    "/account/register",
    "/account/forgot-password",
    "/account/reset-password",
  ];
  
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || 
               pathname.startsWith("/invite/") || 
               pathname.startsWith("/account/reset-password")
  );
  const isApiRoute = pathname.startsWith("/api/");
  const isStaticAsset =
    pathname.startsWith("/_next/") || 
    pathname.startsWith("/fonts/") ||
    pathname.includes(".");

  // Skip authentication for public routes, API routes (they handle their own auth), and static assets
  if (isPublicRoute || isApiRoute || isStaticAsset) {
    return NextResponse.next();
  }

  // Check for auth token presence (full validation happens in API routes)
  const token = request.cookies.get("auth_token")?.value;

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and images
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
