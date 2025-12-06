import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Get a specific health worker
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

    const worker = await prisma.healthWorker.findFirst({
      where: {
        id,
        hospitalId: hospitalAdmin.hospitalId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            immunizationsGiven: true,
          },
        },
      },
    });

    if (!worker) {
      return NextResponse.json({ error: "Health worker not found" }, { status: 404 });
    }

    return NextResponse.json(worker);
  } catch (error) {
    console.error("Error fetching health worker:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update a health worker
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

    const worker = await prisma.healthWorker.findFirst({
      where: {
        id,
        hospitalId: hospitalAdmin.hospitalId,
      },
    });

    if (!worker) {
      return NextResponse.json({ error: "Health worker not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      phone,
      staffId,
      specialization,
      canRegisterMothers,
      canRegisterChildren,
      canRecordImmunizations,
      canViewAllPatients,
    } = body;

    // Update user and health worker in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: worker.userId },
        data: {
          name,
          phone: phone || null,
        },
      });

      // Update health worker
      const updatedWorker = await tx.healthWorker.update({
        where: { id },
        data: {
          staffId: staffId || null,
          specialization: specialization || null,
          canRegisterMothers: canRegisterMothers ?? true,
          canRegisterChildren: canRegisterChildren ?? true,
          canRecordImmunizations: canRecordImmunizations ?? true,
          canViewAllPatients: canViewAllPatients ?? false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true,
            },
          },
        },
      });

      return updatedWorker;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating health worker:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete a health worker
export async function DELETE(
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

    const worker = await prisma.healthWorker.findFirst({
      where: {
        id,
        hospitalId: hospitalAdmin.hospitalId,
      },
    });

    if (!worker) {
      return NextResponse.json({ error: "Health worker not found" }, { status: 404 });
    }

    // Delete user (cascades to health worker)
    await prisma.user.delete({
      where: { id: worker.userId },
    });

    return NextResponse.json({ message: "Health worker deleted" });
  } catch (error) {
    console.error("Error deleting health worker:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
