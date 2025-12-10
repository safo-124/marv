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

// GET - Get child details
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

    const child = await prisma.child.findFirst({
      where: {
        id,
        mother: {
          currentHospitalId: payload.hospitalId,
        },
      },
      include: {
        mother: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            address: true,
          },
        },
        immunizationRecords: {
          include: {
            vaccine: true,
            recordedBy: {
              select: {
                id: true,
                name: true,
              },
            },
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
    });

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    return NextResponse.json(child);
  } catch (error) {
    console.error("Error fetching child:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update child
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

    // Verify child belongs to this hospital
    const existing = await prisma.child.findFirst({
      where: {
        id,
        mother: {
          currentHospitalId: payload.hospitalId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const child = await prisma.child.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        gender: body.gender,
        birthWeight: body.birthWeight ? parseFloat(body.birthWeight) : undefined,
        bloodGroup: body.bloodGroup,
        genotype: body.genotype,
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

    return NextResponse.json(child);
  } catch (error) {
    console.error("Error updating child:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
