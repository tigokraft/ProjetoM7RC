import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, isWorkspaceAdmin } from "@/lib/auth";

const createLinkSchema = z.object({
  maxUses: z.number().min(1).max(100).default(10),
  expiresInDays: z.number().min(1).max(30).optional(),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/workspaces/:id/invites/links - List invite links
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
    
    const links = await prisma.workspaceInviteLink.findMany({
      where: { workspaceId: id },
      orderBy: { createdAt: "desc" },
    });
    
    // Filter out expired links
    const now = new Date();
    const validLinks = links.map((link: typeof links[0]) => ({
      ...link,
      isExpired: link.expiresAt ? link.expiresAt < now : false,
      isExhausted: link.uses >= link.maxUses,
    }));
    
    return NextResponse.json({ links: validLinks });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch invite links", details: error },
      { status: 500 }
    );
  }
}

// POST /api/workspaces/:id/invites/links - Create invite link
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
    
    // Verify workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    
    const body = await req.json().catch(() => ({}));
    const parsed = createLinkSchema.safeParse(body);
    
    const maxUses = parsed.success ? parsed.data.maxUses : 10;
    const expiresInDays = parsed.success ? parsed.data.expiresInDays : undefined;
    
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;
    
    const link = await prisma.workspaceInviteLink.create({
      data: {
        workspaceId: id,
        createdById: user.id,
        maxUses,
        expiresAt,
      },
    });
    
    return NextResponse.json({ 
      link,
      inviteUrl: `/invite/${link.code}`,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create invite link", details: error },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/:id/invites/links - Delete invite link
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
    const linkId = url.searchParams.get("linkId");
    
    if (!linkId) {
      return NextResponse.json({ error: "Link ID required" }, { status: 400 });
    }
    
    await prisma.workspaceInviteLink.delete({
      where: { id: linkId, workspaceId: id },
    });
    
    return NextResponse.json({ message: "Link eliminado" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete invite link", details: error },
      { status: 500 }
    );
  }
}
