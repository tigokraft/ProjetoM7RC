import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceMember } from "@/lib/auth";

const respondSchema = z.object({
  optionId: z.string(),
});

type Params = { params: Promise<{ id: string; voteId: string }> };

// POST /api/workspaces/:id/votes/:voteId/respond - Submit vote response
export async function POST(req: NextRequest, { params }: Params) {
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
    
    const body = await req.json();
    const parsed = respondSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { optionId } = parsed.data;
    
    // Verify vote exists and option belongs to it
    const vote = await prisma.vote.findUnique({
      where: { id: voteId },
      include: { options: { select: { id: true } } }
    });
    
    if (!vote || vote.workspaceId !== id) {
      return NextResponse.json({ error: "Vote not found" }, { status: 404 });
    }
    
    // Check if vote has expired
    if (vote.expiresAt && vote.expiresAt < new Date()) {
      return NextResponse.json({ error: "This vote has expired" }, { status: 400 });
    }
    
    // Verify option belongs to this vote
    if (!vote.options.some(o => o.id === optionId)) {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 });
    }
    
    // Check if user already voted (on any option)
    const existingResponse = await prisma.voteResponse.findFirst({
      where: {
        userId: user.id,
        option: { voteId }
      }
    });
    
    if (existingResponse) {
      // Update existing vote
      await prisma.voteResponse.delete({ where: { id: existingResponse.id } });
    }
    
    // Create new response
    const response = await prisma.voteResponse.create({
      data: {
        optionId,
        userId: user.id
      },
      include: {
        option: { select: { id: true, text: true } }
      }
    });
    
    return NextResponse.json({ 
      message: existingResponse ? "Vote changed" : "Vote submitted",
      response 
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit vote", details: error },
      { status: 500 }
    );
  }
}
