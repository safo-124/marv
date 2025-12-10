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

// GET - List immunization schedules
export async function GET(request: NextRequest) {
  try {
    const payload = getTokenPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // SCHEDULED, COMPLETED, MISSED
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const childId = searchParams.get("childId");

    const where: Record<string, unknown> = {
      child: {
        mother: {
          currentHospitalId: payload.hospitalId,
        },
      },
    };

    if (status) {
      where.status = status;
    }

    if (childId) {
      where.childId = childId;
    }

    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) {
        (where.scheduledDate as Record<string, Date>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.scheduledDate as Record<string, Date>).lte = new Date(dateTo);
      }
    }

    const schedules = await prisma.immunizationSchedule.findMany({
      where,
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            mother: {
              select: {
                id: true,
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
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
