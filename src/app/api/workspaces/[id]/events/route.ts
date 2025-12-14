import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin, isWorkspaceMember } from "@/lib/auth";

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  location: z.string().max(500).optional(),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/workspaces/:id/events - List events
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
    
    // Parse query params for date filtering
    const url = new URL(req.url);
    const startFrom = url.searchParams.get("startFrom");
    const startTo = url.searchParams.get("startTo");
    
    const events = await prisma.event.findMany({
      where: {
        workspaceId: id,
        ...(startFrom || startTo ? {
          startDate: {
            ...(startFrom ? { gte: new Date(startFrom) } : {}),
            ...(startTo ? { lte: new Date(startTo) } : {})
          }
        } : {})
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { attendances: true } }
      },
      orderBy: { startDate: "asc" }
    });
    
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch events", details: error },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/:id/events - Create event
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
    const parsed = createEventSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    const { title, description, startDate, endDate, location } = parsed.data;
    
    // Validate dates
    if (endDate && new Date(endDate) < new Date(startDate)) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }
    
    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        location,
        workspaceId: id,
        createdById: user.id
      },
      include: {
        createdBy: { select: { id: true, name: true } }
      }
    });
    
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create event", details: error },
      { status: 500 }
    );
  }
}
