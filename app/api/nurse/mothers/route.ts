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

// GET - List mothers for the hospital
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
      currentHospitalId: payload.hospitalId,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
          { registrationNumber: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [mothers, total] = await Promise.all([
      prisma.mother.findMany({
        where,
        include: {
          children: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
            },
            orderBy: { dateOfBirth: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.mother.count({ where }),
    ]);

    return NextResponse.json({
      data: mothers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching mothers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Register a new mother
export async function POST(request: NextRequest) {
  try {
    const payload = getTokenPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      dateOfBirth,
      phone,
      alternatePhone,
      email,
      address,
      city,
      state,
      bloodGroup,
      genotype,
      allergies,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "First name, last name, and phone are required" },
        { status: 400 }
      );
    }

    const mother = await prisma.mother.create({
      data: {
        currentHospitalId: payload.hospitalId,
        registeredById: payload.id,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        phone,
        alternatePhone: alternatePhone || null,
        email: email || null,
        address: address || null,
        city: city || null,
        state: state || null,
        bloodGroup: bloodGroup || null,
        genotype: genotype || null,
        allergies: allergies || null,
        registrationType: "WALK_IN",
      },
      include: {
        children: true,
      },
    });

    return NextResponse.json(mother, { status: 201 });
  } catch (error) {
    console.error("Error creating mother:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
