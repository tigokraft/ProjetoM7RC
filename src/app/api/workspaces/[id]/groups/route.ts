import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin, isWorkspaceMember } from "@/lib/auth";

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  memberIds: z.array(z.string()).optional(),
});

const autoGenerateSchema = z.object({
  groupCount: z.number().min(2).max(50),
  groupNamePrefix: z.string().optional().default("Grupo"),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/workspaces/:id/groups - List groups
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
    
    const groups = await prisma.group.findMany({
      where: { workspaceId: id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        _count: { select: { members: true } }
      },
      orderBy: { createdAt: "asc" }
    });
    
    return NextResponse.json({ groups });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch groups", details: error },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/:id/groups - Create group
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
    const parsed = createGroupSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { name, memberIds } = parsed.data;
    
    const group = await prisma.group.create({
      data: {
        name,
        workspaceId: id,
        members: memberIds ? {
          create: memberIds.map(userId => ({ userId }))
        } : undefined
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      }
    });
    
    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create group", details: error },
      { status: 500 }
    );
  }
}
