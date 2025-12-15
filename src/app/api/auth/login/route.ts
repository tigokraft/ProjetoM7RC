import { NextResponse, NextRequest } from "next/server";
import * as z from "zod";
import { comparePassword } from "@/lib/Hasher";
import { signToken } from "@/lib/Jwt";
import { serialize } from "cookie";
import { prisma } from "@/lib/prisma";

const userObj = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  let parsedBody;

  try {
    parsedBody = userObj.safeParse(await req.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsedBody.error },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON format", details: error },
      { status: 400 }
    );
  }

  try {
    const { email, password } = parsedBody.data;
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) {
      return NextResponse.json({ error: "Email not found" }, { status: 401 });
    }

    if (!(await comparePassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      message: "Login successful",
      token,
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}