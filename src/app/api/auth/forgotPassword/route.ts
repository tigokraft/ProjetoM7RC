import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as z from "zod";

const prisma = new PrismaClient();

const forgotPasswordObj = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const parsedBody = forgotPasswordObj.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid request data", details: parsedBody.error },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: parsedBody.data.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User with this email does not exist" },
        { status: 404 }
      );
    }

    const resetPassword = await prisma.forgotPassword.create({
      data: {
        userId: user.id,
        validUntil: new Date(Date.now() + 3600 * 1000), // 1 hour from now
      },
    });

    return NextResponse.json(
      {
        message: "Password reset request created",
        resetId: resetPassword.id, // for testing purposes only | DO NOT RETURN THIS IN PRODUCTION
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
