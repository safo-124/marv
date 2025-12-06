import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Get all exports for the hospital
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

    const exports = await prisma.dataExport.findMany({
      where: { hospitalId: hospitalAdmin.hospitalId },
      orderBy: { requestedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Transform to match frontend expectations
    const transformedExports = exports.map((exp) => ({
      ...exp,
      type: exp.exportType,
      requestedBy: exp.user,
    }));

    return NextResponse.json(transformedExports);
  } catch (error) {
    console.error("Error fetching exports:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new export request
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
    const { type, format, includeArchived, dateRange } = body;

    // Map frontend type to schema exportType
    const typeMap: Record<string, string> = {
      MOTHERS: "MOTHERS",
      CHILDREN: "CHILDREN",
      IMMUNIZATIONS: "IMMUNIZATIONS",
      SCHEDULES: "IMMUNIZATIONS",
      HEALTH_WORKERS: "FULL",
      ALERTS: "FULL",
      FULL_REPORT: "FULL",
    };
    const exportType = typeMap[type] || "FULL";

    // Map frontend format to schema format
    const formatMap: Record<string, string> = {
      CSV: "CSV",
      XLSX: "EXCEL",
      JSON: "JSON",
      PDF: "JSON", // PDF not in schema, fall back to JSON
    };
    const exportFormat = formatMap[format] || "CSV";

    // Create export request
    const dataExport = await prisma.dataExport.create({
      data: {
        hospitalId: hospitalAdmin.hospitalId,
        userId: session.user.id,
        exportType: exportType as "MOTHERS" | "CHILDREN" | "IMMUNIZATIONS" | "FULL",
        format: exportFormat as "CSV" | "EXCEL" | "JSON",
        scope: "HOSPITAL",
        status: "PENDING",
        filters: {
          originalType: type,
          includeArchived: includeArchived || false,
          dateRange: dateRange || "ALL",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // In a real implementation, you would trigger a background job here
    // For now, we'll simulate the export process
    processExportAsync(dataExport.id, hospitalAdmin.hospitalId, type);

    // Transform for frontend
    const response = {
      ...dataExport,
      type,
      requestedBy: dataExport.user,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error creating export:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Simulated async export processing
async function processExportAsync(
  exportId: string,
  hospitalId: string,
  type: string
) {
  try {
    // Update status to processing
    await prisma.dataExport.update({
      where: { id: exportId },
      data: { status: "PROCESSING" },
    });

    // Get record count based on type
    let recordCount = 0;
    switch (type) {
      case "MOTHERS":
        recordCount = await prisma.mother.count({ where: { currentHospitalId: hospitalId } });
        break;
      case "CHILDREN":
        recordCount = await prisma.child.count({
          where: { mother: { currentHospitalId: hospitalId } },
        });
        break;
      case "IMMUNIZATIONS":
      case "SCHEDULES":
        recordCount = await prisma.immunizationRecord.count({
          where: { child: { mother: { currentHospitalId: hospitalId } } },
        });
        break;
      case "HEALTH_WORKERS":
        recordCount = await prisma.healthWorker.count({ where: { hospitalId } });
        break;
      case "ALERTS":
        recordCount = await prisma.performanceAlert.count({ where: { hospitalId } });
        break;
      case "FULL_REPORT":
        const mothers = await prisma.mother.count({ where: { currentHospitalId: hospitalId } });
        const children = await prisma.child.count({
          where: { mother: { currentHospitalId: hospitalId } },
        });
        const records = await prisma.immunizationRecord.count({
          where: { child: { mother: { currentHospitalId: hospitalId } } },
        });
        recordCount = mothers + children + records;
        break;
    }

    // Update export with completed status
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    await prisma.dataExport.update({
      where: { id: exportId },
      data: {
        status: "COMPLETED",
        recordCount,
        completedAt: new Date(),
        expiresAt,
      },
    });
  } catch (error) {
    console.error("Error processing export:", error);
    await prisma.dataExport.update({
      where: { id: exportId },
      data: { status: "FAILED" },
    });
  }
}
