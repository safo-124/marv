import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const createHospitalSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/),
  code: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
})

// GET all hospitals
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hospitals = await prisma.hospital.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            admins: true,
            healthWorkers: true,
            mothers: true,
            children: true,
          },
        },
      },
    })

    return NextResponse.json(hospitals)
  } catch (error) {
    console.error("Error fetching hospitals:", error)
    return NextResponse.json(
      { error: "Failed to fetch hospitals" },
      { status: 500 }
    )
  }
}

// POST create hospital
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createHospitalSchema.parse(body)

    // Check if slug already exists
    const existingHospital = await prisma.hospital.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingHospital) {
      return NextResponse.json(
        { error: "A hospital with this subdomain already exists" },
        { status: 400 }
      )
    }

    // Check if code already exists (if provided)
    if (validatedData.code) {
      const existingCode = await prisma.hospital.findUnique({
        where: { code: validatedData.code },
      })

      if (existingCode) {
        return NextResponse.json(
          { error: "A hospital with this code already exists" },
          { status: 400 }
        )
      }
    }

    const hospital = await prisma.hospital.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        code: validatedData.code || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        status: "PENDING",
        // Create default notification settings
        notificationSettings: {
          create: {
            frequency: "ESCALATING",
            escalationDays: [1, 3, 7, 14],
            emailEnabled: true,
            smsEnabled: true,
            pushEnabled: true,
            reminderDaysBefore: 3,
          },
        },
      },
      include: {
        notificationSettings: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "Hospital",
        entityId: hospital.id,
        newValues: hospital,
      },
    })

    return NextResponse.json(hospital, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating hospital:", error)
    return NextResponse.json(
      { error: "Failed to create hospital" },
      { status: 500 }
    )
  }
}
