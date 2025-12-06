import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Get list of other hospitals for transfer destinations
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

    // Get all active hospitals except current one
    const hospitals = await prisma.hospital.findMany({
      where: {
        id: { not: hospitalAdmin.hospitalId },
        status: "ACTIVE",
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        state: true,
      },
    });

    return NextResponse.json(hospitals);
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
