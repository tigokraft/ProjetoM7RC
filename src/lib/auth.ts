import { NextRequest } from "next/server";
import { verifyToken } from "./Jwt";
import { prisma } from "./prisma";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Extract and verify user from request cookies
 * Returns null if no valid token found
 */
export async function getUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get("auth_token")?.value;
  
  if (!token) {
    return null;
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded || !decoded.userId) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, name: true }
  });
  
  return user;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(req: NextRequest): Promise<AuthUser> {
  const user = await getUserFromRequest(req);
  
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  return user;
}

/**
 * Check if user is a member of a workspace
 */
export async function isWorkspaceMember(
  userId: string, 
  workspaceId: string
): Promise<boolean> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId }
    }
  });
  
  return !!member;
}

/**
 * Check if user is an admin of a workspace (owner or admin role)
 */
export async function isWorkspaceAdmin(
  userId: string, 
  workspaceId: string
): Promise<boolean> {
  // Check if user is the owner
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerId: true }
  });
  
  if (workspace?.ownerId === userId) {
    return true;
  }
  
  // Check if user has admin role
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId }
    },
    select: { role: true }
  });
  
  return member?.role === "ADMIN";
}

/**
 * Get user's role in a workspace
 */
export async function getWorkspaceRole(
  userId: string, 
  workspaceId: string
): Promise<"OWNER" | "ADMIN" | "USER" | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerId: true }
  });
  
  if (workspace?.ownerId === userId) {
    return "OWNER";
  }
  
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId }
    },
    select: { role: true }
  });
  
  if (!member) {
    return null;
  }
  
  return member.role;
}
