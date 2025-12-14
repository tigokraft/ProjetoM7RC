import * as z from "zod";
import { NextResponse, NextRequest } from "next/server";
import { hashPassword } from "@/lib/Hasher";
import { signToken } from "@/lib/Jwt";
import { serialize } from "cookie";
import { prisma } from "@/lib/prisma";

const userObj = z.object({
  name: z.string().min(5),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  // try to parse request body
  let parsedBody;
  try {
    parsedBody = userObj.safeParse(await request.json());

    // validate request body
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
    // extract user data from parsed body
    const { name, email, password } = parsedBody.data;

    // check if user already exists
    if (await prisma.user.findUnique({ where: { email: email } })) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    const token = signToken({ userId: user.id, email: user.email });

    // set the cookie and return the token for testing purposes
    const response = NextResponse.json({
      message: "User registered successfully",
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
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}