import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - List mothers for the hospital
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

    const mothers = await prisma.mother.findMany({
      where: { currentHospitalId: hospitalAdmin.hospitalId },
      include: {
        _count: {
          select: {
            children: true,
          },
        },
        children: {
          orderBy: { dateOfBirth: "desc" },
          take: 1,
          select: {
            dateOfBirth: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Add lastDeliveryDate from most recent child
    const mothersWithDeliveryDate = mothers.map((mother) => ({
      ...mother,
      lastDeliveryDate: mother.children[0]?.dateOfBirth || null,
    }));

    return NextResponse.json(mothersWithDeliveryDate);
  } catch (error) {
    console.error("Error fetching mothers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Register a new mother
export async function POST(request: NextRequest) {
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
      registrationType,
    } = body;

    const mother = await prisma.mother.create({
      data: {
        currentHospitalId: hospitalAdmin.hospitalId,
        registeredById: session.user.id,
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
        registrationType: registrationType || "DELIVERY",
      },
      include: {
        _count: {
          select: {
            children: true,
          },
        },
      },
    });

    return NextResponse.json(mother, { status: 201 });
  } catch (error) {
    console.error("Error creating mother:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
