import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const statusSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = statusSchema.parse(body)

    const hospital = await prisma.hospital.findUnique({
      where: { id },
    })

    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
    }

    const oldStatus = hospital.status

    const updatedHospital = await prisma.hospital.update({
      where: { id },
      data: { status },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "Hospital",
        entityId: id,
        oldValues: { status: oldStatus },
        newValues: { status },
      },
    })

    return NextResponse.json(updatedHospital)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid status", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating hospital status:", error)
    return NextResponse.json(
      { error: "Failed to update hospital status" },
      { status: 500 }
    )
  }
}
