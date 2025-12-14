import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// PUT /api/notifications/:id - Mark as read
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true }
    });
    
    if (!notification || notification.userId !== user.id) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    
    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    
    return NextResponse.json({ notification: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update notification", details: error },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/:id - Delete notification
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true }
    });
    
    if (!notification || notification.userId !== user.id) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    
    await prisma.notification.delete({ where: { id } });
    
    return NextResponse.json({ message: "Notification deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete notification", details: error },
      { status: 500 }
    );
  }
}
