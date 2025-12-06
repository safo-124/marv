import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH - Toggle vaccine active status
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
    });

    if (!vaccine) {
      return NextResponse.json({ error: "Vaccine not found" }, { status: 404 });
    }

    const updatedVaccine = await prisma.hospitalVaccine.update({
      where: { id },
      data: { isActive: !vaccine.isActive },
    });

    return NextResponse.json(updatedVaccine);
  } catch (error) {
    console.error("Error toggling vaccine:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
