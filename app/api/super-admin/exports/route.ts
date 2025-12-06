import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/auth-utils"

// GET /api/super-admin/exports - Get all exports
export async function GET() {
  try {
    await requireSuperAdmin()

    const exports = await prisma.dataExport.findMany({
      take: 50,
      orderBy: { requestedAt: "desc" },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(exports)
  } catch (error) {
    console.error("Failed to fetch exports:", error)
    return NextResponse.json(
      { message: "Failed to fetch exports" },
      { status: 500 }
    )
  }
}

// POST /api/super-admin/exports - Create new export
export async function POST(request: NextRequest) {
  try {
    const session = await requireSuperAdmin()
    const body = await request.json()

    const { type, hospitalId } = body

    // Create export record
    const dataExport = await prisma.dataExport.create({
      data: {
        exportType: type,
        scope: hospitalId ? "HOSPITAL" : "SYSTEM",
        format: "CSV",
        hospitalId: hospitalId || null,
        userId: session.user.id,
        status: "PENDING",
      },
    })

    // In a real application, you would trigger a background job here
    // to actually process the export. For now, we'll simulate completion.
    
    // Simulate processing (in production, this would be a background job)
    setTimeout(async () => {
      try {
        let recordCount = 0

        // Get record count based on type
        switch (type) {
          case "MOTHERS":
            recordCount = await prisma.mother.count({
              where: hospitalId ? { currentHospitalId: hospitalId } : {},
            })
            break
          case "CHILDREN":
            recordCount = await prisma.child.count({
              where: hospitalId ? { currentHospitalId: hospitalId } : {},
            })
            break
          case "IMMUNIZATIONS":
            recordCount = await prisma.immunizationRecord.count({
              where: hospitalId ? { hospitalId } : {},
            })
            break
          case "HEALTH_WORKERS":
            recordCount = await prisma.healthWorker.count({
              where: hospitalId ? { hospitalId } : {},
            })
            break
          case "FULL":
            if (hospitalId) {
              const [mothers, children, records] = await Promise.all([
                prisma.mother.count({ where: { currentHospitalId: hospitalId } }),
                prisma.child.count({ where: { currentHospitalId: hospitalId } }),
                prisma.immunizationRecord.count({ where: { hospitalId } }),
              ])
              recordCount = mothers + children + records
            }
            break
        }

        // Update export as completed
        await prisma.dataExport.update({
          where: { id: dataExport.id },
          data: {
            status: "COMPLETED",
            recordCount,
            completedAt: new Date(),
            // In production, this would be a real file URL
            fileUrl: `/api/super-admin/exports/${dataExport.id}/download`,
          },
        })

        // Log audit
        await prisma.dataExportAuditLog.create({
          data: {
            exportId: dataExport.id,
            userId: session.user.id,
            action: "REQUESTED",
          },
        })
      } catch (error) {
        console.error("Export processing error:", error)
        await prisma.dataExport.update({
          where: { id: dataExport.id },
          data: { status: "FAILED" },
        })
      }
    }, 2000) // Simulate 2-second processing

    return NextResponse.json(dataExport, { status: 201 })
  } catch (error) {
    console.error("Failed to create export:", error)
    return NextResponse.json(
      { message: "Failed to create export" },
      { status: 500 }
    )
  }
}
