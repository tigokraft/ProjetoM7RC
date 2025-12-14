import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin, isWorkspaceMember } from "@/lib/auth";

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "USER"]).optional().default("USER"),
});

const updateMemberSchema = z.object({
  role: z.enum(["ADMIN", "USER"]),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/workspaces/:id/members - List workspace members
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const isMember = await isWorkspaceMember(user.id, id);
    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: id },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { joinedAt: "asc" }
    });
    
    // Get workspace owner
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { ownerId: true }
    });
    
    return NextResponse.json({ 
      members,
      ownerId: workspace?.ownerId 
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch members", details: error },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/:id/members - Add member (invite by email)
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
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
        { error: "Invalid request data", details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    const { email, role } = parsed.data;
    
    // Find user by email
    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    });
    
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Check if already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: id, userId: targetUser.id } }
    });
    
    if (existingMember) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 });
    }
    
    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: id,
        userId: targetUser.id,
        role
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
    
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add member", details: error },
      { status: 500 }
    );
  }
}
