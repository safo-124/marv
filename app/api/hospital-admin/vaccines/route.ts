import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - List vaccines for the hospital
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the hospital for this admin
    const hospitalAdmin = await prisma.hospitalAdmin.findFirst({
      where: { userId: session.user.id },
      select: { hospitalId: true },
    });

    if (!hospitalAdmin) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const vaccines = await prisma.hospitalVaccine.findMany({
      where: {
        hospitalId: hospitalAdmin.hospitalId,
        ...(activeOnly && { isActive: true }),
      },
      include: {
        _count: {
          select: {
            versions: true,
            immunizationRecords: true,
          },
        },
      },
      orderBy: [
        { isActive: "desc" },
        { minAgeWeeks: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json(vaccines);
  } catch (error) {
    console.error("Error fetching vaccines:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new vaccine
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
      name,
      shortName,
      description,
      manufacturer,
      dosesRequired,
      minAgeWeeks,
      maxAgeWeeks,
      intervalWeeks,
      reminderDaysBefore,
    } = body;

    // Create the vaccine
    const vaccine = await prisma.hospitalVaccine.create({
      data: {
        hospitalId: hospitalAdmin.hospitalId,
        name,
        shortName,
        description: description || null,
        manufacturer: manufacturer || null,
        dosesRequired: dosesRequired || 1,
        minAgeWeeks: minAgeWeeks || 0,
        maxAgeWeeks: maxAgeWeeks || null,
        intervalWeeks: intervalWeeks || null,
        reminderDaysBefore: reminderDaysBefore || 3,
        createdById: session.user.id,
      },
    });

    // Create initial version
    const version = await prisma.hospitalVaccineVersion.create({
      data: {
        vaccineId: vaccine.id,
        versionNumber: 1,
        name: vaccine.name,
        minAgeWeeks: vaccine.minAgeWeeks,
        maxAgeWeeks: vaccine.maxAgeWeeks,
        intervalWeeks: vaccine.intervalWeeks,
        dosesRequired: vaccine.dosesRequired,
        changedById: session.user.id,
        changeReason: "Initial creation",
      },
    });

    // Update vaccine with current version
    await prisma.hospitalVaccine.update({
      where: { id: vaccine.id },
      data: { currentVersionId: version.id },
    });

    return NextResponse.json(vaccine, { status: 201 });
  } catch (error) {
    console.error("Error creating vaccine:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
