import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin, isWorkspaceMember } from "@/lib/auth";

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  type: z.enum(["TRABALHO", "TESTE", "PROJETO", "TAREFA"]).optional(),
  dueDate: z.string().datetime().optional(),
  disciplineId: z.string().nullable().optional(),
});

type Params = { params: Promise<{ id: string; taskId: string }> };

// GET /api/workspaces/:id/tasks/:taskId - Get task details
export async function GET(req: NextRequest, { params }: Params) {
  const { id, taskId } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const isMember = await isWorkspaceMember(user.id, id);
    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        discipline: { select: { id: true, name: true, color: true } },
        createdBy: { select: { id: true, name: true } },
        completions: {
          include: { user: { select: { id: true, name: true } } }
        }
      }
    });
    
    if (!task || task.workspaceId !== id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    
    // Get user's completion status
    const userCompletion = task.completions.find(c => c.userId === user.id);
    
    return NextResponse.json({ 
      task,
      isCompleted: userCompletion?.completed || false,
      completedAt: userCompletion?.completedAt || null
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch task", details: error },
      { status: 500 }
    );
  }
}

// PUT /api/workspaces/:id/tasks/:taskId - Update task
export async function PUT(req: NextRequest, { params }: Params) {
  const { id, taskId } = await params;
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
    const parsed = updateTaskSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      select: { workspaceId: true }
    });
    
    if (!existing || existing.workspaceId !== id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    
    const { dueDate, ...rest } = parsed.data;
    
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...rest,
        ...(dueDate ? { dueDate: new Date(dueDate) } : {})
      },
      include: {
        discipline: { select: { id: true, name: true, color: true } },
        createdBy: { select: { id: true, name: true } }
      }
    });
    
    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update task", details: error },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/:id/tasks/:taskId - Delete task
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, taskId } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const isAdmin = await isWorkspaceAdmin(user.id, id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      select: { workspaceId: true }
    });
    
    if (!existing || existing.workspaceId !== id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    
    await prisma.task.delete({ where: { id: taskId } });
    
    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete task", details: error },
      { status: 500 }
    );
  }
}
