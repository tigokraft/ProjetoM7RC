import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin } from "@/lib/auth";

const autoGenerateSchema = z.object({
  groupCount: z.number().min(2).max(50),
  groupNamePrefix: z.string().optional().default("Grupo"),
});

type Params = { params: Promise<{ id: string }> };

// POST /api/workspaces/:id/groups/auto - Auto-generate groups
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
    const parsed = autoGenerateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { groupCount, groupNamePrefix } = parsed.data;
    
    // Get all workspace members
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: id },
      select: { userId: true }
    });
    
    if (members.length < groupCount) {
      return NextResponse.json(
        { error: "Not enough members for the number of groups" },
        { status: 400 }
      );
    }
    
    // Shuffle members randomly
    const shuffled = members
      .map((m: typeof members[0]) => m.userId)
      .sort(() => Math.random() - 0.5);
    
    // Calculate members per group
    const membersPerGroup = Math.floor(shuffled.length / groupCount);
    const remainder = shuffled.length % groupCount;
    
    // Create groups with distributed members
    const groups = [];
    let memberIndex = 0;
    
    for (let i = 0; i < groupCount; i++) {
      // Some groups get an extra member if there's remainder
      const groupSize = membersPerGroup + (i < remainder ? 1 : 0);
      const groupMembers = shuffled.slice(memberIndex, memberIndex + groupSize);
      memberIndex += groupSize;
      
      const group = await prisma.group.create({
        data: {
          name: `${groupNamePrefix} ${i + 1}`,
          workspaceId: id,
          members: {
            create: groupMembers.map(userId => ({ userId }))
          }
        },
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true } } }
          }
        }
      });
      
      groups.push(group);
    }
    
    return NextResponse.json({ groups }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to auto-generate groups", details: error },
      { status: 500 }
    );
  }
}
