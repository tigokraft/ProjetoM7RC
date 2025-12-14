import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/notifications - Get user's notifications
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    // Parse query params
    const url = new URL(req.url);
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";
    const limit = parseInt(url.searchParams.get("limit") || "50");
    
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { read: false } : {})
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100)
    });
    
    // Count unread
    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false }
    });
    
    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notifications", details: error },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Mark all as read
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true }
    });
    
    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update notifications", details: error },
      { status: 500 }
    );
  }
}
