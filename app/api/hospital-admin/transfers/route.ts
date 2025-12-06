import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Get all transfer requests for the hospital
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

    // Get incoming transfers (to this hospital)
    const incomingTransfers = await prisma.transferRequest.findMany({
      where: { toHospitalId: hospitalAdmin.hospitalId },
      orderBy: { createdAt: "desc" },
      include: {
        fromHospital: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
          },
        },
        toHospital: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get outgoing transfers (from this hospital)
    const outgoingTransfers = await prisma.transferRequest.findMany({
      where: { fromHospitalId: hospitalAdmin.hospitalId },
      orderBy: { createdAt: "desc" },
      include: {
        fromHospital: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
          },
        },
        toHospital: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Fetch mother info for each transfer
    const enrichedIncoming = await Promise.all(
      incomingTransfers.map(async (t) => {
        const mother = await prisma.mother.findUnique({
          where: { id: t.motherId },
          select: { id: true, firstName: true, lastName: true, phone: true },
        });
        return {
          ...t,
          type: "INCOMING" as const,
          requestedAt: t.createdAt,
          mother: mother ? {
            id: mother.id,
            fullName: `${mother.firstName} ${mother.lastName}`,
            phone: mother.phone,
          } : null,
        };
      })
    );

    const enrichedOutgoing = await Promise.all(
      outgoingTransfers.map(async (t) => {
        const mother = await prisma.mother.findUnique({
          where: { id: t.motherId },
          select: { id: true, firstName: true, lastName: true, phone: true },
        });
        return {
          ...t,
          type: "OUTGOING" as const,
          requestedAt: t.createdAt,
          mother: mother ? {
            id: mother.id,
            fullName: `${mother.firstName} ${mother.lastName}`,
            phone: mother.phone,
          } : null,
        };
      })
    );

    // Combine and sort by date
    const allTransfers = [...enrichedIncoming, ...enrichedOutgoing].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(allTransfers);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new transfer request
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
    const { motherId, toHospitalId, notes } = body;

    // Validate mother is specified
    if (!motherId) {
      return NextResponse.json(
        { error: "Mother must be specified" },
        { status: 400 }
      );
    }

    // Validate destination hospital exists
    const toHospital = await prisma.hospital.findUnique({
      where: { id: toHospitalId },
    });

    if (!toHospital) {
      return NextResponse.json(
        { error: "Destination hospital not found" },
        { status: 404 }
      );
    }

    // Validate mother belongs to this hospital
    const mother = await prisma.mother.findFirst({
      where: {
        id: motherId,
        currentHospitalId: hospitalAdmin.hospitalId,
      },
    });

    if (!mother) {
      return NextResponse.json(
        { error: "Mother not found in this hospital" },
        { status: 404 }
      );
    }

    // Check for existing pending transfer
    const existingTransfer = await prisma.transferRequest.findFirst({
      where: {
        motherId,
        status: "PENDING",
      },
    });

    if (existingTransfer) {
      return NextResponse.json(
        { error: "A pending transfer request already exists for this patient" },
        { status: 400 }
      );
    }

    // Create transfer request
    const transfer = await prisma.transferRequest.create({
      data: {
        motherId,
        fromHospitalId: hospitalAdmin.hospitalId,
        toHospitalId,
        requestedById: session.user.id,
        notes: notes || null,
        status: "PENDING",
      },
      include: {
        fromHospital: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
          },
        },
        toHospital: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Enrich with mother info
    const enrichedTransfer = {
      ...transfer,
      type: "OUTGOING" as const,
      requestedAt: transfer.createdAt,
      mother: {
        id: mother.id,
        fullName: `${mother.firstName} ${mother.lastName}`,
        phone: mother.phone,
      },
    };

    return NextResponse.json(enrichedTransfer);
  } catch (error) {
    console.error("Error creating transfer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
