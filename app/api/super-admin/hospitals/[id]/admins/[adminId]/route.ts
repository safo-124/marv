import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/auth-utils"

interface RouteParams {
  params: Promise<{ id: string; adminId: string }>
}

// PATCH /api/super-admin/hospitals/[id]/admins/[adminId] - Update admin status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireSuperAdmin()
    const { id: hospitalId, adminId } = await params
    const body = await request.json()

    const { isActive } = body

    // Find the hospital admin
    const hospitalAdmin = await prisma.hospitalAdmin.findFirst({
      where: { 
        id: adminId,
        hospitalId 
      },
      include: {
        user: true,
      },
    })

    if (!hospitalAdmin) {
      return NextResponse.json(
        { message: "Hospital admin not found" },
        { status: 404 }
      )
    }

    // Update the user's active status
    await prisma.user.update({
      where: { id: hospitalAdmin.userId },
      data: { isActive },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update admin:", error)
    return NextResponse.json(
      { message: "Failed to update admin" },
      { status: 500 }
    )
  }
}

// DELETE /api/super-admin/hospitals/[id]/admins/[adminId] - Remove admin from hospital
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireSuperAdmin()
    const { id: hospitalId, adminId } = await params

    // Find the hospital admin
    const hospitalAdmin = await prisma.hospitalAdmin.findFirst({
      where: { 
        id: adminId,
        hospitalId 
      },
    })

    if (!hospitalAdmin) {
      return NextResponse.json(
        { message: "Hospital admin not found" },
        { status: 404 }
      )
    }

    // Delete the hospital admin relationship (not the user)
    await prisma.hospitalAdmin.delete({
      where: { id: adminId },
    })

    // Optionally update the user's role back to a basic role
    await prisma.user.update({
      where: { id: hospitalAdmin.userId },
      data: { role: "HEALTH_WORKER" }, // or keep as HOSPITAL_ADMIN if they might be admin of another hospital
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete admin:", error)
    return NextResponse.json(
      { message: "Failed to delete admin" },
      { status: 500 }
    )
  }
}
