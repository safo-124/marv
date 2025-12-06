import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Get performance alerts for the hospital
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const alerts = await prisma.performanceAlert.findMany({
      where: {
        hospitalId: hospitalAdmin.hospitalId,
        ...(status && { status: status as "PENDING" | "ACKNOWLEDGED" | "ESCALATED" | "RESOLVED" }),
      },
      include: {
        acknowledgedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { severity: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
