import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin, isWorkspaceMember } from "@/lib/auth";

const respondSchema = z.object({
  optionId: z.string(),
});

type Params = { params: Promise<{ id: string; voteId: string }> };

// GET /api/workspaces/:id/votes/:voteId - Get vote with results
export async function GET(req: NextRequest, { params }: Params) {
  const { id, voteId } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const isMember = await isWorkspaceMember(user.id, id);
    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    const vote = await prisma.vote.findUnique({
      where: { id: voteId },
      include: {
        createdBy: { select: { id: true, name: true } },
        options: {
          include: {
            responses: {
              include: { user: { select: { id: true, name: true } } }
            },
            _count: { select: { responses: true } }
          }
        }
      }
    });
    
    if (!vote || vote.workspaceId !== id) {
      return NextResponse.json({ error: "Vote not found" }, { status: 404 });
    }
    
    // Check if current user has voted
    const userResponse = await prisma.voteResponse.findFirst({
      where: {
        userId: user.id,
        option: { voteId }
      },
      select: { optionId: true }
    });
    
    return NextResponse.json({ 
      vote,
      userVotedOptionId: userResponse?.optionId || null 
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vote", details: error },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/:id/votes/:voteId - Delete vote
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, voteId } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const isAdmin = await isWorkspaceAdmin(user.id, id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    const vote = await prisma.vote.findUnique({
      where: { id: voteId },
      select: { workspaceId: true }
    });
    
    if (!vote || vote.workspaceId !== id) {
      return NextResponse.json({ error: "Vote not found" }, { status: 404 });
    }
    
    await prisma.vote.delete({ where: { id: voteId } });
    
    return NextResponse.json({ message: "Vote deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete vote", details: error },
      { status: 500 }
    );
  }
}
