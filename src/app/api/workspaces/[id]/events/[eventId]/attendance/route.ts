import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin, isWorkspaceMember } from "@/lib/auth";

const markAttendanceSchema = z.object({
  status: z.enum(["PENDING", "PRESENT", "ABSENT", "EXCUSED"]),
});

const bulkAttendanceSchema = z.object({
  attendances: z.array(z.object({
    userId: z.string(),
    status: z.enum(["PENDING", "PRESENT", "ABSENT", "EXCUSED"]),
  }))
});

type Params = { params: Promise<{ id: string; eventId: string }> };

// GET /api/workspaces/:id/events/:eventId/attendance - Get attendance list
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
    
    // Verify event belongs to workspace
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { workspaceId: true, title: true }
    });
    
    if (!event || event.workspaceId !== id) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    const attendances = await prisma.attendance.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { user: { name: "asc" } }
    });
    
    // Get summary stats
    const summary = {
      total: attendances.length,
      present: attendances.filter(a => a.status === "PRESENT").length,
      absent: attendances.filter(a => a.status === "ABSENT").length,
      excused: attendances.filter(a => a.status === "EXCUSED").length,
      pending: attendances.filter(a => a.status === "PENDING").length,
    };
    
    return NextResponse.json({ attendances, summary, eventTitle: event.title });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch attendance", details: error },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/:id/events/:eventId/attendance - Mark own attendance or bulk update
export async function POST(req: NextRequest, { params }: Params) {
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
    
    // Verify event belongs to workspace
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { workspaceId: true }
    });
    
    if (!event || event.workspaceId !== id) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    const body = await req.json();
    
    // Check if bulk update (admin only)
    const bulkParsed = bulkAttendanceSchema.safeParse(body);
    if (bulkParsed.success) {
      const isAdmin = await isWorkspaceAdmin(user.id, id);
      if (!isAdmin) {
        return NextResponse.json({ error: "Admin access required for bulk updates" }, { status: 403 });
      }
      
      // Bulk upsert attendances
      const results = [];
      for (const att of bulkParsed.data.attendances) {
        const attendance = await prisma.attendance.upsert({
          where: { eventId_userId: { eventId, userId: att.userId } },
          update: { 
            status: att.status,
            checkedAt: att.status !== "PENDING" ? new Date() : null
          },
          create: {
            eventId,
            userId: att.userId,
            status: att.status,
            checkedAt: att.status !== "PENDING" ? new Date() : null
          }
        });
        results.push(attendance);
      }
      
      return NextResponse.json({ message: "Attendance updated", count: results.length });
    }
    
    // Single attendance marking (self)
    const parsed = markAttendanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    const attendance = await prisma.attendance.upsert({
      where: { eventId_userId: { eventId, userId: user.id } },
      update: { 
        status: parsed.data.status,
        checkedAt: parsed.data.status !== "PENDING" ? new Date() : null
      },
      create: {
        eventId,
        userId: user.id,
        status: parsed.data.status,
        checkedAt: parsed.data.status !== "PENDING" ? new Date() : null
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });
    
    return NextResponse.json({ attendance });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update attendance", details: error },
      { status: 500 }
    );
  }
}
