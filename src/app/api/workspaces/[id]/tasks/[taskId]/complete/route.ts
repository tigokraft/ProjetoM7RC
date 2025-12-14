import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceMember } from "@/lib/auth";

type Params = { params: Promise<{ id: string; taskId: string }> };

// POST /api/workspaces/:id/tasks/:taskId/complete - Toggle task completion
export async function POST(req: NextRequest, { params }: Params) {
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
    
    // Verify task belongs to workspace
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { workspaceId: true, title: true }
    });
    
    if (!task || task.workspaceId !== id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    
    // Check existing completion
    const existing = await prisma.taskCompletion.findUnique({
      where: { taskId_userId: { taskId, userId: user.id } }
    });
    
    if (existing) {
      // Toggle completion
      const completion = await prisma.taskCompletion.update({
        where: { id: existing.id },
        data: {
          completed: !existing.completed,
          completedAt: !existing.completed ? new Date() : null
        }
      });
      
      return NextResponse.json({ 
        message: completion.completed ? "Task marked as complete" : "Task marked as incomplete",
        completed: completion.completed,
        completedAt: completion.completedAt
      });
    }
    
    // Create new completion (marked as complete)
    const completion = await prisma.taskCompletion.create({
      data: {
        taskId,
        userId: user.id,
        completed: true,
        completedAt: new Date()
      }
    });
    
    return NextResponse.json({ 
      message: "Task marked as complete",
      completed: completion.completed,
      completedAt: completion.completedAt
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update task completion", details: error },
      { status: 500 }
    );
  }
}
