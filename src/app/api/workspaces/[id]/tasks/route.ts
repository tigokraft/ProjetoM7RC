import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin, isWorkspaceMember } from "@/lib/auth";

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(["TRABALHO", "TESTE", "PROJETO", "TAREFA"]),
  dueDate: z.string().datetime(),
  disciplineId: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/workspaces/:id/tasks - List tasks with filters
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
    
    // Parse query params for filtering
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // TRABALHO, TESTE, PROJETO, TAREFA
    const disciplineId = url.searchParams.get("disciplineId");
    const dueFrom = url.searchParams.get("dueFrom");
    const dueTo = url.searchParams.get("dueTo");
    const completed = url.searchParams.get("completed"); // "true" or "false"
    
    const tasks = await prisma.task.findMany({
      where: {
        workspaceId: id,
        ...(type ? { type: type as any } : {}),
        ...(disciplineId ? { disciplineId } : {}),
        ...(dueFrom || dueTo ? {
          dueDate: {
            ...(dueFrom ? { gte: new Date(dueFrom) } : {}),
            ...(dueTo ? { lte: new Date(dueTo) } : {})
          }
        } : {}),
        ...(completed === "true" ? {
          completions: { some: { userId: user.id, completed: true } }
        } : completed === "false" ? {
          NOT: { completions: { some: { userId: user.id, completed: true } } }
        } : {})
      },
      include: {
        discipline: { select: { id: true, name: true, color: true } },
        createdBy: { select: { id: true, name: true } },
        completions: {
          where: { userId: user.id },
          select: { completed: true, completedAt: true }
        },
        _count: { select: { completions: true } }
      },
      orderBy: { dueDate: "asc" }
    });
    
    // Add user's completion status to each task
    const tasksWithStatus = tasks.map(task => ({
      ...task,
      isCompleted: task.completions.length > 0 && task.completions[0].completed,
      completedAt: task.completions.length > 0 ? task.completions[0].completedAt : null
    }));
    
    return NextResponse.json({ tasks: tasksWithStatus });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks", details: error },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/:id/tasks - Create task
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
    const parsed = createTaskSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    const { title, description, type, dueDate, disciplineId } = parsed.data;
    
    // Verify discipline belongs to workspace if provided
    if (disciplineId) {
      const discipline = await prisma.discipline.findUnique({
        where: { id: disciplineId },
        select: { workspaceId: true }
      });
      
      if (!discipline || discipline.workspaceId !== id) {
        return NextResponse.json({ error: "Invalid discipline" }, { status: 400 });
      }
    }
    
    const task = await prisma.task.create({
      data: {
        title,
        description,
        type,
        dueDate: new Date(dueDate),
        workspaceId: id,
        disciplineId,
        createdById: user.id
      },
      include: {
        discipline: { select: { id: true, name: true, color: true } },
        createdBy: { select: { id: true, name: true } }
      }
    });
    
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task", details: error },
      { status: 500 }
    );
  }
}
