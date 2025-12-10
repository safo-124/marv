import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { sign } from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

// POST - Nurse Login (for mobile app)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        healthWorker: {
          include: {
            hospital: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 401 }
      );
    }

    // Verify this is a health worker
    if (user.role !== "HEALTH_WORKER" || !user.healthWorker) {
      return NextResponse.json(
        { error: "This account is not authorized for the nurse app" },
        { status: 403 }
      );
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hospitalId: user.healthWorker.hospitalId,
        healthWorkerId: user.healthWorker.id,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Return user info and token
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        hospitalId: user.healthWorker.hospitalId,
        hospitalName: user.healthWorker.hospital.name,
        healthWorkerId: user.healthWorker.id,
        specialization: user.healthWorker.specialization,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
