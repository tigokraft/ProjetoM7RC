import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin } from "@/lib/auth";

const updateMemberSchema = z.object({
  role: z.enum(["ADMIN", "USER"]),
});

type Params = { params: Promise<{ id: string; memberId: string }> };

// PUT /api/workspaces/:id/members/:memberId - Update member role
export async function PUT(req: NextRequest, { params }: Params) {
  const { id, memberId } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const isAdmin = await isWorkspaceAdmin(user.id, id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    const body = await req.json();
    const parsed = updateMemberSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    // Check if member exists
    const existingMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId }
    });
    
    if (!existingMember || existingMember.workspaceId !== id) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    
    // Can't change owner's role
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { ownerId: true }
    });
    
    if (existingMember.userId === workspace?.ownerId) {
      return NextResponse.json({ error: "Cannot change owner's role" }, { status: 400 });
    }
    
    const member = await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: parsed.data.role },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
    
    return NextResponse.json({ member });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update member", details: error },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/:id/members/:memberId - Remove member
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, memberId } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const isAdmin = await isWorkspaceAdmin(user.id, id);
    
    // Check if member exists
    const existingMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId }
    });
    
    if (!existingMember || existingMember.workspaceId !== id) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    
    // Allow self-removal or admin removal
    if (!isAdmin && existingMember.userId !== user.id) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    // Can't remove owner
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { ownerId: true }
    });
    
    if (existingMember.userId === workspace?.ownerId) {
      return NextResponse.json({ error: "Cannot remove workspace owner" }, { status: 400 });
    }
    
    await prisma.workspaceMember.delete({ where: { id: memberId } });
    
    return NextResponse.json({ message: "Member removed" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove member", details: error },
      { status: 500 }
    );
  }
}
