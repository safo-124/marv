import "dotenv/config";
import prisma from "../lib/prisma";
import { hash } from "bcryptjs";

async function main() {
  console.log("🌱 Starting seed...");

  // Create Super Admin user
  const hashedPassword = await hash("admin123", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@marv.com" },
    update: {},
    create: {
      email: "admin@marv.com",
      name: "Super Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
      emailVerified: new Date(),
    },
  });

  console.log("✅ Super Admin created:", superAdmin.email);

  // Create a test hospital
  const hospital = await prisma.hospital.upsert({
    where: { slug: "kampala-central" },
    update: {},
    create: {
      name: "Kampala Central Hospital",
      slug: "kampala-central",
      code: "KCH001",
      address: "Plot 123, Kampala Road",
      city: "Kampala",
      state: "Central Region",
      country: "Uganda",
      phone: "+256700123456",
      email: "info@kampalacentral.ug",
      status: "ACTIVE",
    },
  });

  console.log("✅ Hospital created:", hospital.name);

  // Create Hospital Admin user
  const hospitalAdminPassword = await hash("hospital123", 12);

  const hospitalAdminUser = await prisma.user.upsert({
    where: { email: "hospitaladmin@marv.com" },
    update: {},
    create: {
      email: "hospitaladmin@marv.com",
      name: "Hospital Administrator",
      password: hospitalAdminPassword,
      role: "HOSPITAL_ADMIN",
      isActive: true,
      emailVerified: new Date(),
    },
  });

  // Link user to hospital as admin
  await prisma.hospitalAdmin.upsert({
    where: { userId: hospitalAdminUser.id },
    update: {},
    create: {
      userId: hospitalAdminUser.id,
      hospitalId: hospital.id,
    },
  });

  console.log("✅ Hospital Admin created:", hospitalAdminUser.email);

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Login Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Super Admin:");
  console.log("  Email: admin@marv.com");
  console.log("  Password: admin123");
  console.log("");
  console.log("Hospital Admin:");
  console.log("  Email: hospitaladmin@marv.com");
  console.log("  Password: hospital123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
