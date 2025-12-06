import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST - Record an immunization
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hospitalAdmin = await prisma.hospitalAdmin.findFirst({
      where: { userId: session.user.id },
      include: {
        hospital: {
          include: {
            healthWorkers: {
              take: 1,
            },
          },
        },
      },
    });

    if (!hospitalAdmin) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      scheduleId,
      childId,
      vaccineId,
      doseNumber,
      administeredDate,
      batchNumber,
      notes,
    } = body;

    // Verify schedule belongs to this hospital
    const schedule = await prisma.immunizationSchedule.findFirst({
      where: {
        id: scheduleId,
        child: {
          currentHospitalId: hospitalAdmin.hospitalId,
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    // Get a health worker for this hospital (use first one or create a default)
    let healthWorkerId = hospitalAdmin.hospital.healthWorkers[0]?.id;
    
    if (!healthWorkerId) {
      // If no health worker exists, we need to handle this case
      // For now, we'll create the record without a health worker relation
      // This should be fixed by requiring a health worker selection in UI
      return NextResponse.json(
        { error: "No health worker available. Please add a health worker first." },
        { status: 400 }
      );
    }

    // Create the immunization record and update schedule
    const result = await prisma.$transaction(async (tx) => {
      // Create the record
      const record = await tx.immunizationRecord.create({
        data: {
          scheduleId,
          childId,
          vaccineId,
          hospitalId: hospitalAdmin.hospitalId,
          healthWorkerId,
          recordedById: session.user.id,
          doseNumber,
          administeredAt: new Date(administeredDate),
          batchNumber: batchNumber || null,
          notes: notes || null,
        },
      });

      // Update the schedule status
      await tx.immunizationSchedule.update({
        where: { id: scheduleId },
        data: { status: "COMPLETED" },
      });

      return record;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error recording immunization:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
