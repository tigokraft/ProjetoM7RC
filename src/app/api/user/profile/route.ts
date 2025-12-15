import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

// PUT /api/user/profile - Update user profile
export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { name, email } = parsed.data;
    
    // Check if email is already taken
    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existing) {
        return NextResponse.json(
          { error: "Este email já está em uso" },
          { status: 400 }
        );
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
      },
      select: { id: true, name: true, email: true },
    });
    
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile", details: error },
      { status: 500 }
    );
  }
}
