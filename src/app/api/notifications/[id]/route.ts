import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const inviteActionSchema = z.object({
  action: z.enum(["accept", "decline"]),
});

type Params = { params: Promise<{ id: string }> };

// POST /api/notifications/:id - Perform action (accept/decline invite)
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });
    
    if (!notification || notification.userId !== user.id) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    
    // Only workspace invites have actions
    if (notification.type !== "WORKSPACE_INVITE") {
      return NextResponse.json({ error: "No action available for this notification" }, { status: 400 });
    }
    
    const body = await req.json();
    const parsed = inviteActionSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    
    const { action } = parsed.data;
    const inviteId = notification.referenceId;
    
    if (!inviteId) {
      return NextResponse.json({ error: "Invalid invite reference" }, { status: 400 });
    }
    
    const invite = await prisma.workspaceInvite.findUnique({
      where: { id: inviteId },
      include: { workspace: { select: { id: true, name: true } } },
    });
    
    if (!invite) {
      // Delete the orphaned notification
      await prisma.notification.delete({ where: { id } });
      return NextResponse.json({ error: "Invite no longer exists" }, { status: 410 });
    }
    
    if (action === "accept") {
      // Check if already a member
      const existingMember = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: invite.workspaceId, userId: user.id } }
      });
      
      if (existingMember) {
        await prisma.$transaction([
          prisma.workspaceInvite.update({
            where: { id: inviteId },
            data: { status: "ACCEPTED" },
          }),
          prisma.notification.update({
            where: { id },
            data: { read: true },
          }),
        ]);
        return NextResponse.json({ 
          message: "Já és membro deste workspace",
          workspaceId: invite.workspaceId
        });
      }
      
      // Add to workspace and update invite status
      await prisma.$transaction([
        prisma.workspaceMember.create({
          data: {
            workspaceId: invite.workspaceId,
            userId: user.id,
            role: "USER",
          },
        }),
        prisma.workspaceInvite.update({
          where: { id: inviteId },
          data: { status: "ACCEPTED" },
        }),
        prisma.notification.update({
          where: { id },
          data: { read: true },
        }),
      ]);
      
      return NextResponse.json({
        message: `Bem-vindo ao workspace "${invite.workspace.name}"!`,
        workspaceId: invite.workspaceId,
      });
    } else {
      // Decline
      await prisma.$transaction([
        prisma.workspaceInvite.update({
          where: { id: inviteId },
          data: { status: "DECLINED" },
        }),
        prisma.notification.update({
          where: { id },
          data: { read: true },
        }),
      ]);
      
      return NextResponse.json({ message: "Convite recusado" });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process action", details: error },
      { status: 500 }
    );
  }
}

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
