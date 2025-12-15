import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin } from "@/lib/auth";

const createInviteSchema = z.object({
  email: z.string().email("Email inválido"),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/workspaces/:id/invites - List pending invites
export async function GET(req: NextRequest, { params }: Params) {
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
    
    const invites = await prisma.workspaceInvite.findMany({
      where: { workspaceId: id },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json({ invites });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch invites", details: error },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/:id/invites - Send email invitation
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
    const parsed = createInviteSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { email } = parsed.data;
    
    // Get workspace info
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { name: true }
    });
    
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    
    // Check if user is already a member
    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
    
    if (targetUser) {
      const existingMember = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: id, userId: targetUser.id } }
      });
      
      if (existingMember) {
        return NextResponse.json(
          { error: "Este utilizador já é membro do workspace" },
          { status: 400 }
        );
      }
    }
    
    // Check for existing pending invite
    const existingInvite = await prisma.workspaceInvite.findUnique({
      where: { workspaceId_email: { workspaceId: id, email } }
    });
    
    if (existingInvite && existingInvite.status === "PENDING") {
      return NextResponse.json(
        { error: "Já existe um convite pendente para este email" },
        { status: 400 }
      );
    }
    
    // Create or update invite
    const invite = await prisma.workspaceInvite.upsert({
      where: { workspaceId_email: { workspaceId: id, email } },
      update: { status: "PENDING", invitedById: user.id },
      create: {
        workspaceId: id,
        email,
        invitedById: user.id,
        status: "PENDING",
      },
    });
    
    // If user exists, create notification
    if (targetUser) {
      await prisma.notification.create({
        data: {
          userId: targetUser.id,
          type: "WORKSPACE_INVITE",
          title: "Convite para Workspace",
          message: `${user.name} convidou-te para o workspace "${workspace.name}"`,
          referenceId: invite.id,
          channels: ["PUSH"],
        },
      });
    }
    
    return NextResponse.json({ 
      invite,
      userExists: !!targetUser,
      message: targetUser 
        ? "Convite enviado! O utilizador vai receber uma notificação."
        : "Convite criado! O utilizador receberá o convite quando se registar."
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create invite", details: error },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/:id/invites - Cancel invite
export async function DELETE(req: NextRequest, { params }: Params) {
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
    
    const url = new URL(req.url);
    const inviteId = url.searchParams.get("inviteId");
    
    if (!inviteId) {
      return NextResponse.json({ error: "Invite ID required" }, { status: 400 });
    }
    
    await prisma.workspaceInvite.delete({
      where: { id: inviteId, workspaceId: id },
    });
    
    return NextResponse.json({ message: "Convite cancelado" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to cancel invite", details: error },
      { status: 500 }
    );
  }
}
