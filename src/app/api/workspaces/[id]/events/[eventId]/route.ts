import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin, isWorkspaceMember } from "@/lib/auth";

const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.string().max(500).optional(),
});

type Params = { params: Promise<{ id: string; eventId: string }> };

// GET /api/workspaces/:id/events/:eventId - Get event details
export async function GET(req: NextRequest, { params }: Params) {
  const { id, eventId } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const isMember = await isWorkspaceMember(user.id, id);
    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        createdBy: { select: { id: true, name: true } },
        attendances: {
          include: { user: { select: { id: true, name: true } } }
        }
      }
    });
    
    if (!event || event.workspaceId !== id) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    // Get user's attendance status
    const userAttendance = event.attendances.find(a => a.userId === user.id);
    
    return NextResponse.json({ event, userAttendanceStatus: userAttendance?.status || null });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch event", details: error },
      { status: 500 }
    );
  }
}

// PUT /api/workspaces/:id/events/:eventId - Update event
export async function PUT(req: NextRequest, { params }: Params) {
  const { id, eventId } = await params;
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
    const parsed = updateEventSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { workspaceId: true, startDate: true }
    });
    
    if (!existingEvent || existingEvent.workspaceId !== id) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    const { startDate, endDate, ...rest } = parsed.data;
    
    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...rest,
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {})
      },
      include: {
        createdBy: { select: { id: true, name: true } }
      }
    });
    
    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update event", details: error },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/:id/events/:eventId - Delete event
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, eventId } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const isAdmin = await isWorkspaceAdmin(user.id, id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { workspaceId: true }
    });
    
    if (!event || event.workspaceId !== id) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    await prisma.event.delete({ where: { id: eventId } });
    
    return NextResponse.json({ message: "Event deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete event", details: error },
      { status: 500 }
    );
  }
}
