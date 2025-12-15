import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceMember } from "@/lib/auth";

const createMessageSchema = z.object({
  content: z.string().min(1).max(1000),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/workspaces/:id/chat - List messages
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
    
    // Get query params
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const before = url.searchParams.get("before"); // cursor for pagination
    
    const messages = await prisma.chatMessage.findMany({
      where: {
        workspaceId: id,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    
    return NextResponse.json({ 
      messages: messages.reverse(), // Return in chronological order
      hasMore: messages.length === limit,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch messages", details: error },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/:id/chat - Send message
export async function POST(req: NextRequest, { params }: Params) {
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
    
    const body = await req.json();
    const parsed = createMessageSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { content } = parsed.data;
    
    const message = await prisma.chatMessage.create({
      data: {
        content,
        workspaceId: id,
        userId: user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
    
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send message", details: error },
      { status: 500 }
    );
  }
}
