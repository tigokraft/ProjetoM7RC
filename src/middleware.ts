import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/Jwt";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/invite/")
  );
  const isApiRoute = pathname.startsWith("/api/");
  const isStaticAsset =
    pathname.startsWith("/_next/") || pathname.includes(".");

  // Skip authentication for public routes, API routes (they handle their own auth), and static assets
  if (isPublicRoute || isApiRoute || isStaticAsset) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get("auth_token")?.value;
  const valid = token && verifyToken(token);

  // If not authenticated, redirect to login
  if (!valid) {
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
