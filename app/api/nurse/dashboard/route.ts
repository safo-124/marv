import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

interface TokenPayload {
  id: string;
  hospitalId: string;
  healthWorkerId: string;
}

function getTokenPayload(request: NextRequest): TokenPayload | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  try {
    return verify(authHeader.substring(7), JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// GET - Dashboard stats for the nurse
export async function GET(request: NextRequest) {
  try {
    const payload = getTokenPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    // Get stats in parallel
    const [
      totalMothers,
      totalChildren,
      todaySchedules,
      overdueSchedules,
      weekSchedules,
      todayImmunizations,
      recentImmunizations,
    ] = await Promise.all([
      // Total mothers
      prisma.mother.count({
        where: { currentHospitalId: payload.hospitalId },
      }),
      // Total children
      prisma.child.count({
        where: { currentHospitalId: payload.hospitalId },
      }),
      // Today's scheduled immunizations
      prisma.immunizationSchedule.count({
        where: {
          child: { currentHospitalId: payload.hospitalId },
          status: "SCHEDULED",
          scheduledDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      // Overdue immunizations
      prisma.immunizationSchedule.count({
        where: {
          child: { currentHospitalId: payload.hospitalId },
          status: "SCHEDULED",
          scheduledDate: {
            lt: today,
          },
        },
      }),
      // This week's scheduled immunizations
      prisma.immunizationSchedule.findMany({
        where: {
          child: { currentHospitalId: payload.hospitalId },
          status: "SCHEDULED",
          scheduledDate: {
            gte: today,
            lt: weekFromNow,
          },
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
          vaccine: true,
        },
        orderBy: { scheduledDate: "asc" },
        take: 10,
      }),
      // Today's completed immunizations by this health worker
      prisma.immunizationRecord.count({
        where: {
          healthWorkerId: payload.healthWorkerId,
          administeredAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      // Recent immunization records
      prisma.immunizationRecord.findMany({
        where: {
          hospitalId: payload.hospitalId,
        },
        include: {
          child: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          vaccine: true,
          recordedBy: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { administeredAt: "desc" },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalMothers,
        totalChildren,
        todaySchedules,
        overdueSchedules,
        todayImmunizations,
      },
      upcomingSchedules: weekSchedules,
      recentImmunizations,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
