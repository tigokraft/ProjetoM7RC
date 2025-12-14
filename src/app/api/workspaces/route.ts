import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(["CLASS", "PERSONAL"]).optional().default("CLASS"),
  votingEnabled: z.boolean().optional().default(false),
});

// GET /api/workspaces - List user's workspaces
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    // Get workspaces where user is owner or member
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true, events: true } }
      },
      orderBy: { updatedAt: "desc" }
    });
    
    return NextResponse.json({ workspaces });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workspaces", details: error },
      { status: 500 }
    );
  }
}

// POST /api/workspaces - Create new workspace
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const parsed = createWorkspaceSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    const { name, description, type, votingEnabled } = parsed.data;
    
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        type,
        votingEnabled,
        ownerId: user.id,
        // Auto-add owner as admin member
        members: {
          create: {
            userId: user.id,
            role: "ADMIN"
          }
        }
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      }
    });
    
    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create workspace", details: error },
      { status: 500 }
    );
  }
}
