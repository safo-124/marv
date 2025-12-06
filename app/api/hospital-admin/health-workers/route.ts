import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - List health workers for the hospital
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

    const workers = await prisma.healthWorker.findMany({
      where: { hospitalId: hospitalAdmin.hospitalId },
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
      orderBy: [
        { user: { isActive: "desc" } },
        { user: { name: "asc" } },
      ],
    });

    return NextResponse.json(workers);
  } catch (error) {
    console.error("Error fetching health workers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new health worker
export async function POST(request: NextRequest) {
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
      email,
      phone,
      password,
      staffId,
      specialization,
      canRegisterMothers,
      canRegisterChildren,
      canRecordImmunizations,
      canViewAllPatients,
    } = body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and health worker in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          password: hashedPassword,
          role: "HEALTH_WORKER",
          createdById: session.user.id,
        },
      });

      const healthWorker = await tx.healthWorker.create({
        data: {
          userId: user.id,
          hospitalId: hospitalAdmin.hospitalId,
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

      return healthWorker;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating health worker:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
