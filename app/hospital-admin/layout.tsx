import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { HospitalAdminSidebar } from "@/components/hospital-admin/sidebar"
import { HospitalAdminHeader } from "@/components/hospital-admin/header"

export default async function HospitalAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Check if user is a hospital admin
  if (session.user.role !== "HOSPITAL_ADMIN") {
    redirect("/unauthorized")
  }

  // Get the hospital admin's hospital
  const hospitalAdmin = await prisma.hospitalAdmin.findFirst({
    where: { userId: session.user.id },
    include: {
      hospital: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
        },
      },
    },
  })

  if (!hospitalAdmin) {
    redirect("/unauthorized")
  }

  // Get pending alerts count for the header
  const pendingAlertsCount = await prisma.performanceAlert.count({
    where: {
      hospitalId: hospitalAdmin.hospital.id,
      status: "PENDING",
    },
  })

  const user = {
    name: session.user.name || "Admin",
    email: session.user.email || "",
    role: session.user.role,
  }

  const hospital = {
    name: hospitalAdmin.hospital.name,
    slug: hospitalAdmin.hospital.slug,
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-100 dark:bg-slate-900">
        <HospitalAdminSidebar user={user} hospital={hospital} />
        <SidebarInset className="flex-1">
          <HospitalAdminHeader 
            user={user} 
            hospital={hospital} 
            pendingAlertsCount={pendingAlertsCount} 
          />
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
