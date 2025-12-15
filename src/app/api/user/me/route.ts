import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/user/me - Get current user
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  
  return NextResponse.json({ user });
}
