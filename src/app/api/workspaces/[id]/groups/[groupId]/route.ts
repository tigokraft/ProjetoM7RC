import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin, isWorkspaceMember } from "@/lib/auth";

const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

const addMemberSchema = z.object({
  userId: z.string(),
});

type Params = { params: Promise<{ id: string; groupId: string }> };

// GET /api/workspaces/:id/groups/:groupId - Get group details
export async function GET(req: NextRequest, { params }: Params) {
  const { id, groupId } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const isMember = await isWorkspaceMember(user.id, id);
    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      }
    });
    
    if (!group || group.workspaceId !== id) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    
    return NextResponse.json({ group });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch group", details: error },
      { status: 500 }
    );
  }
}

// PUT /api/workspaces/:id/groups/:groupId - Update group
export async function PUT(req: NextRequest, { params }: Params) {
  const { id, groupId } = await params;
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
    const parsed = updateGroupSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const group = await prisma.group.update({
      where: { id: groupId },
      data: parsed.data,
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      }
    });
    
    return NextResponse.json({ group });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update group", details: error },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/:id/groups/:groupId - Delete group
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, groupId } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const isAdmin = await isWorkspaceAdmin(user.id, id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    // Verify group belongs to workspace
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { workspaceId: true }
    });
    
    if (!group || group.workspaceId !== id) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    
    await prisma.group.delete({ where: { id: groupId } });
    
    return NextResponse.json({ message: "Group deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete group", details: error },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/:id/groups/:groupId - Add member to group
export async function POST(req: NextRequest, { params }: Params) {
  const { id, groupId } = await params;
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
    const parsed = addMemberSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    // Verify user is a workspace member
    const workspaceMember = await isWorkspaceMember(parsed.data.userId, id);
    if (!workspaceMember) {
      return NextResponse.json(
        { error: "User is not a workspace member" },
        { status: 400 }
      );
    }
    
    // Check if already in group
    const existingMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: parsed.data.userId } }
    });
    
    if (existingMember) {
      return NextResponse.json({ error: "User is already in this group" }, { status: 400 });
    }
    
    const member = await prisma.groupMember.create({
      data: {
        groupId,
        userId: parsed.data.userId
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
    
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add member to group", details: error },
      { status: 500 }
    );
  }
}
