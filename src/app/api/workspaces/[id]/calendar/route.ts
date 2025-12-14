import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceMember } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/workspaces/:id/calendar - Get calendar items (events + tasks)
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
    
    // Parse query params for date range
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    
    // Build date filter
    const dateFilter = startDate || endDate ? {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lte: new Date(endDate) } : {})
    } : undefined;
    
    // Fetch events
    const events = await prisma.event.findMany({
      where: {
        workspaceId: id,
        ...(dateFilter ? { startDate: dateFilter } : {})
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { attendances: true } }
      },
      orderBy: { startDate: "asc" }
    });
    
    // Fetch tasks
    const tasks = await prisma.task.findMany({
      where: {
        workspaceId: id,
        ...(dateFilter ? { dueDate: dateFilter } : {})
      },
      include: {
        discipline: { select: { id: true, name: true, color: true } },
        completions: {
          where: { userId: user.id },
          select: { completed: true }
        }
      },
      orderBy: { dueDate: "asc" }
    });
    
    // Transform to calendar items
    const calendarItems = [
      ...events.map(event => ({
        id: event.id,
        type: "event" as const,
        title: event.title,
        date: event.startDate,
        endDate: event.endDate,
        location: event.location,
        description: event.description,
        createdBy: event.createdBy,
        attendanceCount: event._count.attendances
      })),
      ...tasks.map(task => ({
        id: task.id,
        type: "task" as const,
        title: task.title,
        date: task.dueDate,
        taskType: task.type,
        discipline: task.discipline,
        description: task.description,
        isCompleted: task.completions.length > 0 && task.completions[0].completed
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return NextResponse.json({ 
      items: calendarItems,
      eventCount: events.length,
      taskCount: tasks.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch calendar", details: error },
      { status: 500 }
    );
  }
}
