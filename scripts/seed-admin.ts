import "dotenv/config"
import { hash } from "bcryptjs"
import prisma from "../lib/prisma"

async function seedSuperAdmin() {
  console.log("🌱 Seeding Super Admin...\n")

  try {
    // Check if super admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
    })

    if (existingAdmin) {
      console.log("✅ Super Admin already exists:", existingAdmin.email)
      return
    }

    // Create super admin
    const hashedPassword = await hash("admin123", 12)

    const superAdmin = await prisma.user.create({
      data: {
        email: "admin@marv.ug",
        password: hashedPassword,
        name: "Super Admin",
        role: "SUPER_ADMIN",
        isActive: true,
      },
    })

    console.log("✅ Super Admin created successfully!")
    console.log("   Email:", superAdmin.email)
    console.log("   Password: admin123")
    console.log("\n⚠️  Please change the password after first login!\n")

    // Create system alert settings
    const existingSettings = await prisma.systemAlertSettings.findFirst()
    
    if (!existingSettings) {
      await prisma.systemAlertSettings.create({
        data: {
          overdueThresholdDefault: 20,
          completionDropThreshold: 10,
          inactivityDays: 30,
          escalationDelayDays: 3,
          maxEscalationLevel: 3,
          criticalThreshold: 40,
          emailAlertsEnabled: true,
          pushAlertsEnabled: true,
        },
      })
      console.log("✅ System alert settings created!")
    }

  } catch (error) {
    console.error("❌ Error seeding Super Admin:", error)
    process.exit(1)
  }
}

seedSuperAdmin()
