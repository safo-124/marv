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

// GET - List immunization records
export async function GET(request: NextRequest) {
  try {
    const payload = getTokenPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      hospitalId: payload.hospitalId,
    };

    if (childId) {
      where.childId = childId;
    }

    const [records, total] = await Promise.all([
      prisma.immunizationRecord.findMany({
        where,
        include: {
          child: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
            },
          },
          vaccine: true,
          recordedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { administeredAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.immunizationRecord.count({ where }),
    ]);

    return NextResponse.json({
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching immunization records:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Record a new immunization
export async function POST(request: NextRequest) {
  try {
    const payload = getTokenPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      childId,
      vaccineId,
      scheduleId,
      batchNumber,
      notes,
      doseNumber,
    } = body;

    // Validate required fields
    if (!childId || !vaccineId || !scheduleId) {
      return NextResponse.json(
        { error: "Child ID, vaccine ID, and schedule ID are required" },
        { status: 400 }
      );
    }

    // Verify child belongs to this hospital
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        currentHospitalId: payload.hospitalId,
      },
    });

    if (!child) {
      return NextResponse.json(
        { error: "Child not found in this hospital" },
        { status: 404 }
      );
    }

    // Verify vaccine exists and belongs to this hospital
    const vaccine = await prisma.hospitalVaccine.findFirst({
      where: {
        id: vaccineId,
        hospitalId: payload.hospitalId,
      },
    });

    if (!vaccine) {
      return NextResponse.json(
        { error: "Vaccine not found" },
        { status: 404 }
      );
    }

    // Verify schedule exists
    const schedule = await prisma.immunizationSchedule.findFirst({
      where: {
        id: scheduleId,
        childId,
        vaccineId,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Create immunization record
    const record = await prisma.immunizationRecord.create({
      data: {
        scheduleId,
        childId,
        vaccineId,
        hospitalId: payload.hospitalId,
        healthWorkerId: payload.healthWorkerId,
        recordedById: payload.id,
        doseNumber: doseNumber || schedule.doseNumber,
        batchNumber: batchNumber || null,
        notes: notes || null,
        administeredAt: new Date(),
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
            id: true,
            name: true,
          },
        },
      },
    });

    // Mark schedule as completed
    await prisma.immunizationSchedule.update({
      where: { id: scheduleId },
      data: {
        status: "COMPLETED",
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error recording immunization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
