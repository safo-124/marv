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

// GET - Get mother details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getTokenPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const mother = await prisma.mother.findFirst({
      where: {
        id,
        currentHospitalId: payload.hospitalId,
      },
      include: {
        children: {
          include: {
            immunizationRecords: {
              include: {
                vaccine: true,
              },
              orderBy: { administeredAt: "desc" },
            },
            immunizationSchedules: {
              include: {
                vaccine: true,
              },
              orderBy: { scheduledDate: "asc" },
            },
          },
          orderBy: { dateOfBirth: "desc" },
        },
      },
    });

    if (!mother) {
      return NextResponse.json({ error: "Mother not found" }, { status: 404 });
    }

    return NextResponse.json(mother);
  } catch (error) {
    console.error("Error fetching mother:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update mother
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getTokenPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify mother belongs to this hospital
    const existing = await prisma.mother.findFirst({
      where: {
        id,
        currentHospitalId: payload.hospitalId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Mother not found" }, { status: 404 });
    }

    const mother = await prisma.mother.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        phone: body.phone,
        alternatePhone: body.alternatePhone,
        email: body.email,
        address: body.address,
        city: body.city,
        state: body.state,
        bloodGroup: body.bloodGroup,
        genotype: body.genotype,
        allergies: body.allergies,
      },
      include: {
        children: true,
      },
    });

    return NextResponse.json(mother);
  } catch (error) {
    console.error("Error updating mother:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
