import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin, isWorkspaceMember } from "@/lib/auth";

const updateDisciplineSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

type Params = { params: Promise<{ id: string; disciplineId: string }> };

// GET /api/workspaces/:id/disciplines/:disciplineId - Get discipline
export async function GET(req: NextRequest, { params }: Params) {
  const { id, disciplineId } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const isMember = await isWorkspaceMember(user.id, id);
    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    const discipline = await prisma.discipline.findUnique({
      where: { id: disciplineId },
      include: {
        tasks: {
          orderBy: { dueDate: "asc" },
          include: { _count: { select: { completions: true } } }
        }
      }
    });
    
    if (!discipline || discipline.workspaceId !== id) {
      return NextResponse.json({ error: "Discipline not found" }, { status: 404 });
    }
    
    return NextResponse.json({ discipline });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch discipline", details: error },
      { status: 500 }
    );
  }
}

// PUT /api/workspaces/:id/disciplines/:disciplineId - Update discipline
export async function PUT(req: NextRequest, { params }: Params) {
  const { id, disciplineId } = await params;
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
    const parsed = updateDisciplineSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    const existing = await prisma.discipline.findUnique({
      where: { id: disciplineId },
      select: { workspaceId: true }
    });
    
    if (!existing || existing.workspaceId !== id) {
      return NextResponse.json({ error: "Discipline not found" }, { status: 404 });
    }
    
    const discipline = await prisma.discipline.update({
      where: { id: disciplineId },
      data: parsed.data
    });
    
    return NextResponse.json({ discipline });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update discipline", details: error },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/:id/disciplines/:disciplineId - Delete discipline
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, disciplineId } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const isAdmin = await isWorkspaceAdmin(user.id, id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    const existing = await prisma.discipline.findUnique({
      where: { id: disciplineId },
      select: { workspaceId: true }
    });
    
    if (!existing || existing.workspaceId !== id) {
      return NextResponse.json({ error: "Discipline not found" }, { status: 404 });
    }
    
    await prisma.discipline.delete({ where: { id: disciplineId } });
    
    return NextResponse.json({ message: "Discipline deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete discipline", details: error },
      { status: 500 }
    );
  }
}
