import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Get immunization schedules for the hospital
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Update overdue statuses first
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.immunizationSchedule.updateMany({
      where: {
        child: {
          currentHospitalId: hospitalAdmin.hospitalId,
        },
        status: "SCHEDULED",
        scheduledDate: {
          lt: today,
        },
      },
      data: {
        status: "OVERDUE",
      },
    });

    const schedules = await prisma.immunizationSchedule.findMany({
      where: {
        child: {
          currentHospitalId: hospitalAdmin.hospitalId,
        },
        status: status
          ? (status as "SCHEDULED" | "OVERDUE" | "COMPLETED" | "MISSED")
          : { in: ["SCHEDULED", "OVERDUE"] },
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            mother: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        vaccine: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { scheduledDate: "asc" },
      ],
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
