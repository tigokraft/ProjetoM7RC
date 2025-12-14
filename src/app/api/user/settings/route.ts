import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const updatePreferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  reminderDaysBefore: z.number().min(0).max(30).optional(),
  reminderOnDay: z.boolean().optional(),
});

// GET /api/user/settings - Get notification preferences
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: user.id }
    });
    
    // Create default preferences if not exists
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: { userId: user.id }
      });
    }
    
    return NextResponse.json({ preferences });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch preferences", details: error },
      { status: 500 }
    );
  }
}

// PUT /api/user/settings - Update notification preferences
export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const parsed = updatePreferencesSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: parsed.data,
      create: {
        userId: user.id,
        ...parsed.data
      }
    });
    
    return NextResponse.json({ preferences });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update preferences", details: error },
      { status: 500 }
    );
  }
}
