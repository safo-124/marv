import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Get a specific vaccine
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const hospitalAdmin = await prisma.hospitalAdmin.findFirst({
      where: { userId: session.user.id },
      select: { hospitalId: true },
    });

    if (!hospitalAdmin) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    const vaccine = await prisma.hospitalVaccine.findFirst({
      where: {
        id,
        hospitalId: hospitalAdmin.hospitalId,
      },
      include: {
        versions: {
          include: {
            changedBy: {
              select: { name: true },
            },
          },
          orderBy: { versionNumber: "desc" },
        },
        _count: {
          select: {
            immunizationRecords: true,
            immunizationSchedules: true,
          },
        },
      },
    });

    if (!vaccine) {
      return NextResponse.json({ error: "Vaccine not found" }, { status: 404 });
    }

    return NextResponse.json(vaccine);
  } catch (error) {
    console.error("Error fetching vaccine:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update a vaccine (creates new version)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const hospitalAdmin = await prisma.hospitalAdmin.findFirst({
      where: { userId: session.user.id },
      select: { hospitalId: true },
    });

    if (!hospitalAdmin) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    const vaccine = await prisma.hospitalVaccine.findFirst({
      where: {
        id,
        hospitalId: hospitalAdmin.hospitalId,
      },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    });

    if (!vaccine) {
      return NextResponse.json({ error: "Vaccine not found" }, { status: 404 });
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
      changeReason,
    } = body;

    // Check if there are schedule-affecting changes
    const hasScheduleChanges =
      dosesRequired !== vaccine.dosesRequired ||
      minAgeWeeks !== vaccine.minAgeWeeks ||
      maxAgeWeeks !== vaccine.maxAgeWeeks ||
      intervalWeeks !== vaccine.intervalWeeks;

    // Update vaccine
    const updatedVaccine = await prisma.hospitalVaccine.update({
      where: { id },
      data: {
        name,
        shortName,
        description: description || null,
        manufacturer: manufacturer || null,
        dosesRequired,
        minAgeWeeks,
        maxAgeWeeks: maxAgeWeeks || null,
        intervalWeeks: intervalWeeks || null,
        reminderDaysBefore: reminderDaysBefore || 3,
      },
    });

    // Create new version if there are schedule-affecting changes
    if (hasScheduleChanges) {
      const currentVersionNumber = vaccine.versions[0]?.versionNumber || 0;
      const newVersion = await prisma.hospitalVaccineVersion.create({
        data: {
          vaccineId: vaccine.id,
          versionNumber: currentVersionNumber + 1,
          name: updatedVaccine.name,
          minAgeWeeks: updatedVaccine.minAgeWeeks,
          maxAgeWeeks: updatedVaccine.maxAgeWeeks,
          intervalWeeks: updatedVaccine.intervalWeeks,
          dosesRequired: updatedVaccine.dosesRequired,
          changedById: session.user.id,
          changeReason: changeReason || null,
        },
      });

      await prisma.hospitalVaccine.update({
        where: { id },
        data: { currentVersionId: newVersion.id },
      });
    }

    return NextResponse.json(updatedVaccine);
  } catch (error) {
    console.error("Error updating vaccine:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
