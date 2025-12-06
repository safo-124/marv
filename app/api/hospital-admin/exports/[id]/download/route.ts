import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Download export file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const dataExport = await prisma.dataExport.findFirst({
      where: {
        id,
        hospitalId: hospitalAdmin.hospitalId,
      },
    });

    if (!dataExport) {
      return NextResponse.json({ error: "Export not found" }, { status: 404 });
    }

    if (dataExport.status !== "COMPLETED") {
      return NextResponse.json({ error: "Export is not ready" }, { status: 400 });
    }

    if (dataExport.expiresAt && new Date(dataExport.expiresAt) < new Date()) {
      await prisma.dataExport.update({
        where: { id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json({ error: "Export has expired" }, { status: 410 });
    }

    // Generate actual export data based on exportType
    const exportData = await generateExportData(
      hospitalAdmin.hospitalId,
      dataExport.exportType,
      (dataExport.filters || {}) as Record<string, unknown>
    );

    // Format based on export format
    let content: string;
    let contentType: string;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    let fileName: string;

    switch (dataExport.format) {
      case "JSON":
        content = JSON.stringify(exportData, null, 2);
        contentType = "application/json";
        fileName = `${dataExport.exportType.toLowerCase()}_${timestamp}.json`;
        break;
      case "CSV":
        content = convertToCSV(exportData);
        contentType = "text/csv";
        fileName = `${dataExport.exportType.toLowerCase()}_${timestamp}.csv`;
        break;
      default:
        content = JSON.stringify(exportData, null, 2);
        contentType = "application/json";
        fileName = `export_${timestamp}.json`;
    }

    // Log the download
    await prisma.dataExportAuditLog.create({
      data: {
        exportId: dataExport.id,
        action: "DOWNLOADED",
        userId: session.user.id,
      },
    });

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading export:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function generateExportData(
  hospitalId: string,
  exportType: string,
  filters: Record<string, unknown>
): Promise<Record<string, unknown>[]> {
  // Get original type from filters
  const originalType = (filters?.originalType as string) || exportType;

  switch (originalType) {
    case "MOTHERS":
      return await prisma.mother.findMany({
        where: {
          currentHospitalId: hospitalId,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          address: true,
          city: true,
          state: true,
          dateOfBirth: true,
          createdAt: true,
        },
      });

    case "CHILDREN":
      return await prisma.child.findMany({
        where: {
          mother: { currentHospitalId: hospitalId },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          birthWeight: true,
          createdAt: true,
          mother: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      });

    case "IMMUNIZATIONS":
    case "SCHEDULES":
      return await prisma.immunizationRecord.findMany({
        where: {
          child: { mother: { currentHospitalId: hospitalId } },
        },
        select: {
          id: true,
          administeredAt: true,
          batchNumber: true,
          notes: true,
          child: {
            select: {
              firstName: true,
              lastName: true,
              dateOfBirth: true,
            },
          },
          vaccine: {
            select: {
              name: true,
            },
          },
        },
      });

    case "HEALTH_WORKERS":
      return await prisma.healthWorker.findMany({
        where: {
          hospitalId,
        },
        select: {
          id: true,
          staffId: true,
          specialization: true,
          canRegisterMothers: true,
          canRegisterChildren: true,
          canRecordImmunizations: true,
          canViewAllPatients: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

    case "ALERTS":
    case "PERFORMANCE_ALERTS":
      return await prisma.performanceAlert.findMany({
        where: { hospitalId },
        select: {
          id: true,
          type: true,
          severity: true,
          message: true,
          threshold: true,
          actualValue: true,
          status: true,
          triggeredAt: true,
          resolvedAt: true,
        },
      });

    case "FULL_REPORT":
      const mothers = await prisma.mother.findMany({
        where: { currentHospitalId: hospitalId },
        select: { id: true, firstName: true, lastName: true, phone: true },
      });
      const children = await prisma.child.findMany({
        where: { mother: { currentHospitalId: hospitalId } },
        select: { id: true, firstName: true, lastName: true, dateOfBirth: true },
      });
      const records = await prisma.immunizationRecord.findMany({
        where: { child: { mother: { currentHospitalId: hospitalId } } },
        select: { id: true, administeredAt: true },
      });
      return [
        {
          recordType: "summary",
          totalMothers: mothers.length,
          totalChildren: children.length,
          totalImmunizations: records.length,
          generatedAt: new Date().toISOString(),
        },
        ...mothers.map((m) => ({ recordType: "mother", ...m })),
        ...children.map((c) => ({ recordType: "child", ...c })),
      ];

    default:
      return [];
  }
}

function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  // Flatten nested objects
  const flattenedData = data.map((item) => flattenObject(item));

  // Get all unique headers
  const headers = Array.from(
    new Set(flattenedData.flatMap((item) => Object.keys(item)))
  );

  // Create CSV
  const rows = [
    headers.join(","),
    ...flattenedData.map((item) =>
      headers
        .map((header) => {
          const value = item[header];
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          // Escape quotes and wrap in quotes if contains comma or quote
          if (stringValue.includes(",") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ];

  return rows.join("\n");
}

function flattenObject(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key in obj) {
    const newKey = prefix ? `${prefix}_${key}` : key;
    const value = obj[key];

    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else if (value instanceof Date) {
      result[newKey] = value.toISOString();
    } else {
      result[newKey] = value;
    }
  }

  return result;
}
