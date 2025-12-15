import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import bcrypt from "bcrypt";

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

// PUT /api/user/password - Change user password
export async function PUT(req: NextRequest) {
  const currentUser = await getUserFromRequest(req);
  
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const parsed = updatePasswordSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { currentPassword, newPassword } = parsed.data;
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { password: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Password atual incorreta" },
        { status: 400 }
      );
    }
    
    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashedPassword },
    });
    
    return NextResponse.json({ message: "Password alterada com sucesso" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to change password", details: error },
      { status: 500 }
    );
  }
}
