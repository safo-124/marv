import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH - Toggle health worker active status
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
      include: {
        user: true,
      },
    });

    if (!worker) {
      return NextResponse.json({ error: "Health worker not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: worker.userId },
      data: { isActive: !worker.user.isActive },
    });

    return NextResponse.json({ isActive: updatedUser.isActive });
  } catch (error) {
    console.error("Error toggling health worker:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
