import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Get completed immunization records for the hospital
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

    const records = await prisma.immunizationRecord.findMany({
      where: {
        hospitalId: hospitalAdmin.hospitalId,
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mother: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        vaccine: {
          select: {
            name: true,
            shortName: true,
          },
        },
        recordedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { administeredAt: "desc" },
      take: 100,
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
