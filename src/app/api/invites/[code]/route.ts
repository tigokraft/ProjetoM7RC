import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

type Params = { params: Promise<{ code: string }> };

// GET /api/invites/:code - Get invite link details
export async function GET(req: NextRequest, { params }: Params) {
  const { code } = await params;
  
  try {
    const link = await prisma.workspaceInviteLink.findUnique({
      where: { code },
      include: {
        workspace: { 
          select: { 
            id: true, 
            name: true, 
            description: true,
            _count: { select: { members: true } }
          } 
        },
      },
    });
    
    if (!link) {
      return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
    }
    
    // Check if expired
    if (link.expiresAt && link.expiresAt < new Date()) {
      return NextResponse.json({ error: "Este convite expirou" }, { status: 410 });
    }
    
    // Check if exhausted
    if (link.uses >= link.maxUses) {
      return NextResponse.json({ error: "Este convite atingiu o limite de utilizações" }, { status: 410 });
    }
    
    return NextResponse.json({
      workspace: {
        id: link.workspace.id,
        name: link.workspace.name,
        description: link.workspace.description,
        memberCount: link.workspace._count.members,
      },
      usesRemaining: link.maxUses - link.uses,
      expiresAt: link.expiresAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao obter convite", details: error },
      { status: 500 }
    );
  }
}

// POST /api/invites/:code - Accept invite and join workspace
export async function POST(req: NextRequest, { params }: Params) {
  const { code } = await params;
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const link = await prisma.workspaceInviteLink.findUnique({
      where: { code },
      include: {
        workspace: { select: { id: true, name: true } },
      },
    });
    
    if (!link) {
      return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
    }
    
    // Check if expired
    if (link.expiresAt && link.expiresAt < new Date()) {
      return NextResponse.json({ error: "Este convite expirou" }, { status: 410 });
    }
    
    // Check if exhausted
    if (link.uses >= link.maxUses) {
      return NextResponse.json({ error: "Este convite atingiu o limite de utilizações" }, { status: 410 });
    }
    
    // Check if already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: link.workspaceId, userId: user.id } }
    });
    
    if (existingMember) {
      return NextResponse.json(
        { error: "Já és membro deste workspace", workspaceId: link.workspaceId },
        { status: 400 }
      );
    }
    
    // Add user to workspace and increment uses
    await prisma.$transaction([
      prisma.workspaceMember.create({
        data: {
          workspaceId: link.workspaceId,
          userId: user.id,
          role: "USER",
        },
      }),
      prisma.workspaceInviteLink.update({
        where: { id: link.id },
        data: { uses: { increment: 1 } },
      }),
    ]);
    
    return NextResponse.json({
      message: `Bem-vindo ao workspace "${link.workspace.name}"!`,
      workspaceId: link.workspaceId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao aceitar convite", details: error },
      { status: 500 }
    );
  }
}
