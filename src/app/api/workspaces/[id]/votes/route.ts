import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin, isWorkspaceMember } from "@/lib/auth";

const createVoteSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  options: z.array(z.string().min(1)).min(2).max(10),
  expiresAt: z.string().datetime().optional(),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/workspaces/:id/votes - List votes
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
    
    // Check if voting is enabled
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { votingEnabled: true }
    });
    
    if (!workspace?.votingEnabled) {
      return NextResponse.json({ error: "Voting is not enabled for this workspace" }, { status: 400 });
    }
    
    const votes = await prisma.vote.findMany({
      where: { workspaceId: id },
      include: {
        createdBy: { select: { id: true, name: true } },
        options: {
          include: {
            _count: { select: { responses: true } }
          }
        },
        _count: { select: { options: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    
    return NextResponse.json({ votes });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch votes", details: error },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/:id/votes - Create vote
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
    
    // Check if voting is enabled
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { votingEnabled: true }
    });
    
    if (!workspace?.votingEnabled) {
      return NextResponse.json({ error: "Voting is not enabled for this workspace" }, { status: 400 });
    }
    
    const body = await req.json();
    const parsed = createVoteSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.errors },
        { status: 400 }
      );
    }
    
    const { title, description, options, expiresAt } = parsed.data;
    
    const vote = await prisma.vote.create({
      data: {
        title,
        description,
        workspaceId: id,
        createdById: user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        options: {
          create: options.map(text => ({ text }))
        }
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        options: true
      }
    });
    
    return NextResponse.json({ vote }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create vote", details: error },
      { status: 500 }
    );
  }
}
