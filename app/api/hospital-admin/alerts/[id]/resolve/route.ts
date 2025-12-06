import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH - Resolve an alert
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

    const alert = await prisma.performanceAlert.findFirst({
      where: {
        id,
        hospitalId: hospitalAdmin.hospitalId,
      },
    });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    const body = await request.json();
    const { resolutionNote } = body;

    const updatedAlert = await prisma.performanceAlert.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
        resolvedNote: resolutionNote || null,
        // Also acknowledge if not already
        ...(alert.status === "PENDING" && {
          acknowledgedById: session.user.id,
          acknowledgedAt: new Date(),
        }),
      },
    });

    return NextResponse.json(updatedAlert);
  } catch (error) {
    console.error("Error resolving alert:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
