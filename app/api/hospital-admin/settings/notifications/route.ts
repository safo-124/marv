import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Get notification settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hospitalAdmin = await prisma.hospitalAdmin.findFirst({
      where: { userId: session.user.id },
      select: { hospitalId: true },
    });

    if (!hospitalAdmin) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    let settings = await prisma.hospitalNotificationSettings.findUnique({
      where: { hospitalId: hospitalAdmin.hospitalId },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.hospitalNotificationSettings.create({
        data: {
          hospitalId: hospitalAdmin.hospitalId,
          frequency: "ESCALATING",
          emailEnabled: true,
          smsEnabled: true,
          pushEnabled: false,
          quietHoursStart: null,
          quietHoursEnd: null,
          reminderDaysBefore: 3,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update notification settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hospitalAdmin = await prisma.hospitalAdmin.findFirst({
      where: { userId: session.user.id },
      select: { hospitalId: true },
    });

    if (!hospitalAdmin) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      frequency,
      emailEnabled,
      smsEnabled,
      pushEnabled,
      quietHoursStart,
      quietHoursEnd,
      reminderDaysBefore,
      escalationDays,
    } = body;

    const settings = await prisma.hospitalNotificationSettings.upsert({
      where: { hospitalId: hospitalAdmin.hospitalId },
      create: {
        hospitalId: hospitalAdmin.hospitalId,
        frequency: frequency || "ESCALATING",
        emailEnabled: emailEnabled ?? true,
        smsEnabled: smsEnabled ?? true,
        pushEnabled: pushEnabled ?? false,
        quietHoursStart: quietHoursStart ?? null,
        quietHoursEnd: quietHoursEnd ?? null,
        reminderDaysBefore: reminderDaysBefore ?? 3,
        escalationDays: escalationDays || [1, 3, 7, 14],
      },
      update: {
        frequency,
        emailEnabled,
        smsEnabled,
        pushEnabled,
        quietHoursStart: quietHoursStart ?? null,
        quietHoursEnd: quietHoursEnd ?? null,
        reminderDaysBefore,
        escalationDays,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
