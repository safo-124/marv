import { requireSuperAdmin } from "@/lib/auth-utils"
import { SuperAdminSidebar } from "@/components/super-admin/sidebar"
import { SuperAdminHeader } from "@/components/super-admin/header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSuperAdmin()

  return (
    <div className="min-h-screen gradient-mesh bg-background">
      <SidebarProvider>
        <SuperAdminSidebar user={session.user} />
        <SidebarInset className="bg-transparent">
          <SuperAdminHeader user={session.user} />
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
