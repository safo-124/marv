import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH - Respond to transfer request (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { action, rejectionReason } = body;

    // Validate action
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Find the transfer request (must be incoming to this hospital)
    const transfer = await prisma.transferRequest.findFirst({
      where: {
        id,
        toHospitalId: hospitalAdmin.hospitalId,
        status: "PENDING",
      },
    });

    if (!transfer) {
      return NextResponse.json(
        { error: "Transfer request not found or already processed" },
        { status: 404 }
      );
    }

    if (action === "reject") {
      // Update transfer status to rejected
      const updatedTransfer = await prisma.transferRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason || null,
        },
        include: {
          fromHospital: {
            select: { id: true, name: true, slug: true, city: true },
          },
          toHospital: {
            select: { id: true, name: true, slug: true, city: true },
          },
          requestedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json(updatedTransfer);
    }

    // Approve: Transfer the mother to this hospital
    await prisma.$transaction(async (tx) => {
      // Update mother's hospital
      await tx.mother.update({
        where: { id: transfer.motherId },
        data: { currentHospitalId: hospitalAdmin.hospitalId },
      });

      // Update transfer status
      await tx.transferRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedById: session.user.id,
          approvedAt: new Date(),
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "TRANSFER_APPROVED",
          entity: "MOTHER",
          entityId: transfer.motherId,
          newValues: {
            fromHospitalId: transfer.fromHospitalId,
            toHospitalId: transfer.toHospitalId,
            transferRequestId: id,
          },
        },
      });
    });

    const updatedTransfer = await prisma.transferRequest.findUnique({
      where: { id },
      include: {
        fromHospital: {
          select: { id: true, name: true, slug: true, city: true },
        },
        toHospital: {
          select: { id: true, name: true, slug: true, city: true },
        },
        requestedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(updatedTransfer);
  } catch (error) {
    console.error("Error responding to transfer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
