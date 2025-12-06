import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/auth-utils"
import bcrypt from "bcryptjs"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/super-admin/hospitals/[id]/admins - Get hospital admins
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireSuperAdmin()
    const { id } = await params

    const admins = await prisma.hospitalAdmin.findMany({
      where: { hospitalId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(admins)
  } catch (error) {
    console.error("Failed to fetch admins:", error)
    return NextResponse.json(
      { message: "Failed to fetch admins" },
      { status: 500 }
    )
  }
}

// POST /api/super-admin/hospitals/[id]/admins - Create hospital admin
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await requireSuperAdmin()
    const { id: hospitalId } = await params
    const body = await request.json()

    const { name, email, password, phone } = body

    // Check if hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
    })

    if (!hospital) {
      return NextResponse.json(
        { message: "Hospital not found" },
        { status: 404 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "A user with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and hospital admin in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: "HOSPITAL_ADMIN",
        },
      })

      const hospitalAdmin = await tx.hospitalAdmin.create({
        data: {
          userId: user.id,
          hospitalId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
      })

      return hospitalAdmin
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Failed to create admin:", error)
    return NextResponse.json(
      { message: "Failed to create admin" },
      { status: 500 }
    )
  }
}
