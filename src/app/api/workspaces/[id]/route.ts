import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin, isWorkspaceMember } from "@/lib/auth";

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  votingEnabled: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/workspaces/:id - Get workspace details
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        _count: {
          select: { groups: true, tasks: true, events: true, disciplines: true }
        }
      }
    });
    
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    
    // Check if user has access
    const isMember = await isWorkspaceMember(user.id, id);
    if (!isMember && workspace.ownerId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    return NextResponse.json({ workspace });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workspace", details: error },
      { status: 500 }
    );
  }
}

// PUT /api/workspaces/:id - Update workspace
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    // Check admin access
    const isAdmin = await isWorkspaceAdmin(user.id, id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    const body = await req.json();
    const parsed = updateWorkspaceSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    const workspace = await prisma.workspace.update({
      where: { id },
      data: parsed.data,
      include: {
        owner: { select: { id: true, name: true, email: true } }
      }
    });
    
    return NextResponse.json({ workspace });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update workspace", details: error },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/:id - Delete workspace
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    // Only owner can delete
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { ownerId: true }
    });
    
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    
    if (workspace.ownerId !== user.id) {
      return NextResponse.json({ error: "Only owner can delete workspace" }, { status: 403 });
    }
    
    await prisma.workspace.delete({ where: { id } });
    
    return NextResponse.json({ message: "Workspace deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete workspace", details: error },
      { status: 500 }
    );
  }
}
