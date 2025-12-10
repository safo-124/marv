import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  hospitalId: string;
  healthWorkerId: string;
}

// GET - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    let payload: TokenPayload;
    try {
      payload = verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        healthWorker: {
          include: {
            hospital: true,
          },
        },
      },
    });

    if (!user || !user.healthWorker) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      hospitalId: user.healthWorker.hospitalId,
      hospitalName: user.healthWorker.hospital.name,
      healthWorkerId: user.healthWorker.id,
      specialization: user.healthWorker.specialization,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
