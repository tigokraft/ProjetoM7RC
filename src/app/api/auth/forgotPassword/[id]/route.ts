import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as z from "zod";
import { hashPassword } from "@/lib/Hasher";

const prisma = new PrismaClient();

const resetPasswordObj = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // params.id is the params from the route [id]
  const parsedBody = resetPasswordObj.safeParse(await req.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid request data", details: parsedBody.error },
      { status: 400 }
    );
  }

  if (parsedBody.data.password !== parsedBody.data.confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match" },
      { status: 400 }
    );
  }

  try {
    const resetRequest = await prisma.forgotPassword.findUnique({
      where: {
        id,
      },
    });
    if (!resetRequest) {
      return NextResponse.json(
        { error: "Invalid password reset request" },
        { status: 404 }
      );
    }

    if (resetRequest.used) {
      return NextResponse.json(
        { error: "This password reset link has already been used" },
        { status: 400 }
      );
    }

    if (resetRequest.validUntil < new Date()) {
      return NextResponse.json(
        { error: "This password reset link has expired" },
        { status: 400 }
      );
    }

    const updateRequest = await prisma.forgotPassword.update({
      where: { id },
      data: { used: true },
    });

    const updateUserPassword = await prisma.user.update({
      where: { id: resetRequest.userId },
      data: { password: await hashPassword(parsedBody.data.password) },
    });

    const hashedPassword = await hashPassword(parsedBody.data.password);

    return NextResponse.json(
      { message: "Password has been reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
