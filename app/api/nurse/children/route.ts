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

// GET - List children for the hospital
export async function GET(request: NextRequest) {
  try {
    const payload = getTokenPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = {
      mother: {
        currentHospitalId: payload.hospitalId,
      },
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { registrationNumber: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [children, total] = await Promise.all([
      prisma.child.findMany({
        where,
        include: {
          mother: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          _count: {
            select: {
              immunizationRecords: true,
              immunizationSchedules: true,
            },
          },
        },
        orderBy: { dateOfBirth: "desc" },
        skip,
        take: limit,
      }),
      prisma.child.count({ where }),
    ]);

    return NextResponse.json({
      data: children,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching children:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Register a new child
export async function POST(request: NextRequest) {
  try {
    const payload = getTokenPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      motherId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      birthWeight,
      birthPlace,
      deliveryType,
      bloodGroup,
      genotype,
    } = body;

    // Validate required fields
    if (!motherId || !firstName || !lastName || !dateOfBirth || !gender) {
      return NextResponse.json(
        { error: "Mother ID, first name, last name, date of birth, and gender are required" },
        { status: 400 }
      );
    }

    // Verify mother belongs to this hospital
    const mother = await prisma.mother.findFirst({
      where: {
        id: motherId,
        currentHospitalId: payload.hospitalId,
      },
    });

    if (!mother) {
      return NextResponse.json(
        { error: "Mother not found in this hospital" },
        { status: 404 }
      );
    }

    const child = await prisma.child.create({
      data: {
        motherId,
        currentHospitalId: payload.hospitalId,
        registeredById: payload.id,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        birthWeight: birthWeight ? parseFloat(birthWeight) : null,
        bloodGroup: bloodGroup || null,
        genotype: genotype || null,
      },
      include: {
        mother: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    // Auto-generate immunization schedules based on Uganda EPI schedule
    await generateImmunizationSchedule(child.id, new Date(dateOfBirth), payload.hospitalId);

    return NextResponse.json(child, { status: 201 });
  } catch (error) {
    console.error("Error creating child:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to generate immunization schedule
async function generateImmunizationSchedule(
  childId: string,
  dateOfBirth: Date,
  hospitalId: string
) {
  // Get active vaccines for the hospital
  const vaccines = await prisma.hospitalVaccine.findMany({
    where: {
      hospitalId,
      isActive: true,
    },
  });

  const schedules = vaccines.map((vaccine) => {
    const scheduledDate = new Date(dateOfBirth);
    scheduledDate.setDate(scheduledDate.getDate() + (vaccine.minAgeWeeks || 0) * 7);

    return {
      childId,
      vaccineId: vaccine.id,
      scheduledDate,
      status: "SCHEDULED" as const,
    };
  });

  if (schedules.length > 0) {
    await prisma.immunizationSchedule.createMany({
      data: schedules,
    });
  }
}
