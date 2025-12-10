import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

interface TokenPayload {
  id: string;
  hospitalId: string;
  healthWorkerId: string;
}

function getTokenPayload(request: NextRequest): TokenPayload | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  try {
    return verify(authHeader.substring(7), JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// GET - List vaccines for the hospital
export async function GET(request: NextRequest) {
  try {
    const payload = getTokenPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vaccines = await prisma.hospitalVaccine.findMany({
      where: {
        hospitalId: payload.hospitalId,
        isActive: true,
      },
      orderBy: [
        { minAgeWeeks: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json(vaccines);
  } catch (error) {
    console.error("Error fetching vaccines:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
