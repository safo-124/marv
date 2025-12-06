import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Get hospital settings
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

    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalAdmin.hospitalId },
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        state: true,
        overdueThreshold: true,
        alertsEnabled: true,
      },
    });

    return NextResponse.json(hospital);
  } catch (error) {
    console.error("Error fetching hospital settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update hospital settings
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const {
      name,
      phone,
      email,
      address,
      city,
      state,
      overdueThreshold,
      alertsEnabled,
    } = body;

    const hospital = await prisma.hospital.update({
      where: { id: hospitalAdmin.hospitalId },
      data: {
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        city: city || null,
        state: state || null,
        overdueThreshold: overdueThreshold ?? 20,
        alertsEnabled: alertsEnabled ?? true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        state: true,
        overdueThreshold: true,
        alertsEnabled: true,
      },
    });

    return NextResponse.json(hospital);
  } catch (error) {
    console.error("Error updating hospital settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
