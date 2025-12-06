import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/auth-utils"

// GET /api/super-admin/settings - Get system settings
export async function GET() {
  try {
    await requireSuperAdmin()

    const settings = await prisma.systemAlertSettings.findFirst({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json(
      { message: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

// POST /api/super-admin/settings - Update system settings
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin()
    const body = await request.json()

    const {
      overdueThresholdDefault,
      escalationDelayDays,
      completionDropThreshold,
      inactivityDays,
      criticalThreshold,
      emailAlertsEnabled,
      pushAlertsEnabled,
    } = body

    // Upsert settings - create new or update existing
    const existingSettings = await prisma.systemAlertSettings.findFirst({
      orderBy: { createdAt: "desc" },
    })

    let settings

    if (existingSettings) {
      settings = await prisma.systemAlertSettings.update({
        where: { id: existingSettings.id },
        data: {
          overdueThresholdDefault,
          escalationDelayDays,
          completionDropThreshold,
          inactivityDays,
          criticalThreshold,
          emailAlertsEnabled,
          pushAlertsEnabled,
        },
      })
    } else {
      settings = await prisma.systemAlertSettings.create({
        data: {
          overdueThresholdDefault,
          escalationDelayDays,
          completionDropThreshold,
          inactivityDays,
          criticalThreshold,
          emailAlertsEnabled,
          pushAlertsEnabled,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Failed to update settings:", error)
    return NextResponse.json(
      { message: "Failed to update settings" },
      { status: 500 }
    )
  }
}
