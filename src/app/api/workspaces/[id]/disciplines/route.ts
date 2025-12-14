import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin, isWorkspaceMember } from "@/lib/auth";

const createDisciplineSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(), // Hex color
});

type Params = { params: Promise<{ id: string }> };

// GET /api/workspaces/:id/disciplines - List disciplines
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
    
    const disciplines = await prisma.discipline.findMany({
      where: { workspaceId: id },
      include: {
        _count: { select: { tasks: true } }
      },
      orderBy: { name: "asc" }
    });
    
    return NextResponse.json({ disciplines });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch disciplines", details: error },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/:id/disciplines - Create discipline
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
    const parsed = createDisciplineSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const discipline = await prisma.discipline.create({
      data: {
        ...parsed.data,
        workspaceId: id
      }
    });
    
    return NextResponse.json({ discipline }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create discipline", details: error },
      { status: 500 }
    );
  }
}
