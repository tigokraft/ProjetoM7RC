import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/Jwt";

export function proxy(request: NextRequest) {
  // 1. Read the cookie
  const token = request.cookies.get("auth_token")?.value;
  const valid = token && verifyToken(token);

  // 2. If the cookie is missing or empty, bounce to home
  if (!valid) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};
