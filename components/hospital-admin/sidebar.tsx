"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Syringe,
  Users,
  UserCog,
  Baby,
  Bell,
  Settings,
  FileDown,
  AlertTriangle,
  Calendar,
  ArrowLeftRight,
  Building2,
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/hospital-admin",
    icon: LayoutDashboard,
  },
  {
    title: "Vaccine Catalog",
    href: "/hospital-admin/vaccines",
    icon: Syringe,
  },
  {
    title: "Health Workers",
    href: "/hospital-admin/health-workers",
    icon: UserCog,
  },
  {
    title: "Mothers",
    href: "/hospital-admin/mothers",
    icon: Users,
  },
  {
    title: "Children",
    href: "/hospital-admin/children",
    icon: Baby,
  },
  {
    title: "Immunizations",
    href: "/hospital-admin/immunizations",
    icon: Calendar,
  },
  {
    title: "Performance Alerts",
    href: "/hospital-admin/alerts",
    icon: AlertTriangle,
  },
  {
    title: "Transfers",
    href: "/hospital-admin/transfers",
    icon: ArrowLeftRight,
  },
  {
    title: "Data Exports",
    href: "/hospital-admin/exports",
    icon: FileDown,
  },
  {
    title: "Notifications",
    href: "/hospital-admin/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    href: "/hospital-admin/settings",
    icon: Settings,
  },
]

interface HospitalAdminSidebarProps {
  user: {
    name: string
    email: string
    role: string
  }
  hospital: {
    name: string
    slug: string
  }
}

export function HospitalAdminSidebar({ user, hospital }: HospitalAdminSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r-0">
      <div className="h-full bg-slate-800 dark:bg-slate-900 rounded-r-2xl shadow-xl">
        <SidebarHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white truncate">
                {hospital.name}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                {hospital.slug}.marv.ug
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 uppercase text-xs tracking-wider px-3 mb-2">
              Hospital Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.slice(0, 6).map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== "/hospital-admin" && pathname.startsWith(item.href))
                  
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white border border-emerald-500/30"
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <item.icon className={`h-5 w-5 ${isActive ? "text-emerald-400" : ""}`} />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-slate-500 uppercase text-xs tracking-wider px-3 mb-2">
              Operations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.slice(6).map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href)
                  
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white border border-emerald-500/30"
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <item.icon className={`h-5 w-5 ${isActive ? "text-emerald-400" : ""}`} />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 mt-auto">
          <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user.name?.charAt(0) || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  )
}
